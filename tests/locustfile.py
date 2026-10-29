"""
Aegis Growth OS — High-Volume Concurrent Load Testing Pipeline
Simulates realistic concurrent user sessions arriving from AI platforms
(ChatGPT, Perplexity, Claude, Google SGE) hitting the dynamic interceptor gateway
and converting through personalized lead generation forms.
"""

import os
import random
import uuid
from locust import HttpUser, task, between

class AegisPlatformLoadTester(HttpUser):
    """
    Simulates high-velocity concurrent traffic spikes hitting the interceptor endpoint 
    to pressure-test the Redis cache & TimescaleDB hypertable ingestion cluster.
    """
    # Wait between 500ms and 2000ms per simulated visitor task loop execution
    wait_time = between(0.5, 2.0)

    def on_start(self):
        """Executes upon simulated runner thread initialization setup."""
        self.client_tokens = [
            "pk_live_8f3a9e2c1b4d6e7f8a9b0c",
            "pk_live_4a5b6c7d8e9f0a1b2c3d4e",
            "pk_live_9z8y7x6w5v4u3t2s1r0q9p"
        ]
        self.ai_referrers = [
            "https://perplexity.ai",
            "https://chatgpt.com",
            "https://claude.ai",
            "https://google.com/search?q=ai+overview"
        ]
        self.target_urls = [
            "https://fintechdb.io/enterprise",
            "https://fintechdb.io/pricing",
            "https://fintechdb.io/docs/latency-benchmarks"
        ]

    @task(weight=8)
    def simulate_inbound_interception_traffic(self):
        """Simulates high-frequency dynamic JavaScript tag ingress queries."""
        payload = {
            "client_token": random.choice(self.client_tokens),
            "session_id": f"sess_{uuid.uuid4().hex[:24].upper()}",
            "referrer_url": random.choice(self.ai_referrers),
            "current_url": random.choice(self.target_urls),
            "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "screen_resolution": "1920x1080"
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {payload['client_token']}"
        }
        
        with self.client.post("/api/v1/interceptor/intent", json=payload, headers=headers, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"HTTP Latency/Failure encountered: Status {response.status_code}")

    @task(weight=2)
    def simulate_lead_form_conversion(self):
        """Simulates an end-user conversion filling out dynamic, context-aware forms."""
        payload = {
            "company_id": str(uuid.uuid4()),
            "email_address": f"load_test_lead_{uuid.uuid4().hex[:8]}@enterprise-firm.com",
            "first_name": "Performance",
            "last_name": "Tester",
            "company_name": "Global Asset Management LLC",
            "initial_acquisition_intent": "Scaling distributed timebucket database matrices under transactional load.",
            "inbound_metadata": {
                "captured_via": "Primary Product Core CTA Form",
                "aegis_intent_context_id": f"int_{uuid.uuid4().hex[:24]}"
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer sk_live_load_test_signature_token"
        }
        
        with self.client.post("/api/v1/leads", json=payload, headers=headers, catch_response=True) as response:
            if response.status_code in [200, 201]:
                response.success()
            else:
                response.failure(f"Lead Sync Failure: {response.text}")
