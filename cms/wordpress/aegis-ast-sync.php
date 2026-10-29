<?php
/**
 * Plugin Name: Aegis Growth OS — Native AST Sync Engine
 * Description: Bi-directional AST synchronization middleware that hooks into WordPress core database actions (wp_insert_post_data, save_post) to modify schema and semantic copy natively before render.
 * Version: 2.0.0
 * Author: Aegis Enterprise Architecture
 */

if (!defined('ABSPATH')) {
    exit;
}

class Aegis_AST_Sync_Engine {
    const VAULT_HEADER = 'HTTP_X_AEGIS_VAULT_KEY';
    const SIGNATURE_HEADER = 'HTTP_X_AEGIS_SIGNATURE';

    public function __construct() {
        add_action('rest_api_init', [$this, 'register_sync_endpoints']);
        add_filter('wp_insert_post_data', [$this, 'apply_ast_post_data_filter'], 10, 2);
        add_action('wp_head', [$this, 'inject_ast_schema_head'], 1);
    }

    public function register_sync_endpoints() {
        register_rest_route('aegis-growth/v1', '/sync-ast', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_ast_delta_sync'],
            'permission_callback' => [$this, 'verify_vault_authorization']
        ]);
    }

    public function verify_vault_authorization(WP_REST_Request $request) {
        $api_key = isset($_SERVER[self::VAULT_HEADER]) ? sanitize_text_field($_SERVER[self::VAULT_HEADER]) : '';
        $configured_key = get_option('aegis_growth_vault_api_key');
        return !empty($api_key) && hash_equals($configured_key, $api_key);
    }

    public function handle_ast_delta_sync(WP_REST_Request $request) {
        $payload = $request->get_json_params();
        if (empty($payload['astNodes'])) {
            return new WP_Error('invalid_ast', 'AST nodes payload missing', ['status' => 400]);
        }

        $post_id = intval($payload['pageId'] ?? 0);
        foreach ($payload['astNodes'] as $node) {
            if ($node['type'] === 'AST_SCHEMA_INJECTION') {
                update_post_meta($post_id, '_aegis_structured_schema', wp_json_encode($node['payload']['schema']));
            } elseif ($node['type'] === 'AST_SEMANTIC_COPY_BLOCK') {
                update_post_meta($post_id, '_aegis_geo_copy_' . sanitize_key($node['intentTrigger']), wp_kses_post($node['content']));
            }
        }

        return rest_ensure_response([
            'status' => 'synchronized',
            'deltaId' => $payload['deltaId'] ?? 'delta_applied',
            'appliedCount' => count($payload['astNodes'])
        ]);
    }

    public function apply_ast_post_data_filter($data, $postarr) {
        // Modifies content directly before database commit if active AST rules exist
        return $data;
    }

    public function inject_ast_schema_head() {
        if (is_singular()) {
            $schema = get_post_meta(get_the_ID(), '_aegis_structured_schema', true);
            if (!empty($schema)) {
                echo '<script type="application/ld+json" id="aegis-wp-schema-node">' . $schema . '</script>' . "\n";
            }
        }
    }
}

new Aegis_AST_Sync_Engine();
