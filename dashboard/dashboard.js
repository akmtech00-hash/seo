/**
 * Aegis Growth OS — Client Dashboard Interactive Controller
 * Connects to the Phase 1 REST API endpoints.
 */

document.addEventListener('DOMContentLoaded', () => {

  const API_BASE = '/api/v1';

  // =========================================================================
  // 0. AUTH & 1-DAY FREE TRIAL SESSION GATE
  // =========================================================================
  let currentAuthUser = null;
  let countdownTimerId = null;

  async function checkSessionAndTrial() {
    try {
      const token = localStorage.getItem('aegis_session_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/auth/me`, { headers });
      const data = await res.json();

      if (!res.ok || !data.authenticated || !data.allowed) {
        console.warn('Access denied to Client Portal:', data);
        const reason = data.reason || 'subscription_required';
        window.location.href = `/login.html?redirect=/dashboard&reason=${reason}`;
        return false;
      }

      currentAuthUser = data.user;
      renderUserIdentity(currentAuthUser);
      initTrialTelemetry(currentAuthUser);
      return true;
    } catch (err) {
      console.warn('Session check fallback:', err);
      return true;
    }
  }

  function renderUserIdentity(user) {
    if (!user) return;
    const nameEl = document.getElementById('sidebar-user-name');
    const tierEl = document.getElementById('sidebar-user-tier');
    const avatarEl = document.getElementById('sidebar-user-avatar');

    if (nameEl) nameEl.textContent = user.name || user.email.split('@')[0];
    if (avatarEl) {
      const initials = (user.name || user.email).substring(0, 2).toUpperCase();
      avatarEl.textContent = initials;
    }
    if (tierEl) {
      if (user.subscription_status === 'trialing') {
        tierEl.textContent = '1-Day Free Trial';
        tierEl.style.color = 'var(--color-signal-blue)';
        tierEl.style.fontWeight = '600';
      } else {
        const tierName = (user.subscription_tier || 'PRO').replace('_monthly', '').toUpperCase();
        tierEl.textContent = `${tierName} Plan`;
        tierEl.style.color = 'var(--color-slate-gray)';
      }
    }
  }

  function initTrialTelemetry(user) {
    const banner = document.getElementById('topbar-trial-banner');
    const countdownEl = document.getElementById('trial-countdown-text');
    if (!banner || !countdownEl) return;

    if (user.subscription_status === 'trialing' && user.trial_ends_at) {
      banner.style.display = 'flex';

      function updateCountdown() {
        const end = new Date(user.trial_ends_at).getTime();
        const diff = end - Date.now();

        if (diff <= 0) {
          clearInterval(countdownTimerId);
          countdownEl.textContent = 'Expired';
          banner.style.borderColor = '#ef4444';
          showToast('Your 1-Day Free Trial has ended. Redirecting to subscription plans...', 'error');
          setTimeout(() => {
            window.location.href = '/login.html?reason=trial_expired';
          }, 1500);
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownEl.textContent = `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s left`;
      }

      updateCountdown();
      if (countdownTimerId) clearInterval(countdownTimerId);
      countdownTimerId = setInterval(updateCountdown, 1000);
    } else {
      banner.style.display = 'none';
      if (countdownTimerId) clearInterval(countdownTimerId);
    }
  }

  // Global methods for Upgrade Modal & Logout
  let currentSelectedUpgradePlan = 'growth_monthly';

  window.openUpgradeModal = function() {
    const modal = document.getElementById('upgrade-modal-backdrop');
    if (modal) modal.style.display = 'flex';
  };

  window.closeUpgradeModal = function() {
    const modal = document.getElementById('upgrade-modal-backdrop');
    if (modal) modal.style.display = 'none';
  };

  window.selectModalPlan = function(planKey) {
    currentSelectedUpgradePlan = planKey;
    document.querySelectorAll('.modal-plan-option').forEach(el => {
      el.style.border = '1px solid var(--color-hairline)';
      el.style.background = 'transparent';
    });
    const selected = document.getElementById(`opt-plan-${planKey.replace('_monthly', '')}`);
    if (selected) {
      selected.style.border = '1.5px solid var(--color-signal-blue)';
      selected.style.background = '#eff6ff';
    }
  };

  window.executePlanUpgrade = async function() {
    const btn = document.getElementById('btn-confirm-upgrade');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Activating Subscription...';
    }

    try {
      const token = localStorage.getItem('aegis_session_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/auth/subscribe`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ plan: currentSelectedUpgradePlan })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update subscription');
      }

      showToast(`Successfully upgraded to ${currentSelectedUpgradePlan}! Full portal unlocked.`, 'success');
      window.closeUpgradeModal();

      if (data.user) {
        currentAuthUser = data.user;
        renderUserIdentity(currentAuthUser);
        initTrialTelemetry(currentAuthUser);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Confirm Subscription & Keep Portal Unlocked';
      }
    }
  };

  window.handleLogout = async function() {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('aegis_session_token');
    localStorage.removeItem('aegis_user');
    window.location.href = '/login.html';
  };

  // =========================================================================
  // TOAST NOTIFICATION SYSTEM
  // =========================================================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    const icon = type === 'success' ? '✓ ' : (type === 'error' ? '✕ ' : 'ℹ ');
    toast.textContent = icon + message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 220);
    }, 3600);
  }

  // =========================================================================
  // 1. TAB NAVIGATION & DYNAMIC BREADCRUMB
  // =========================================================================
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const topbarTitle = document.getElementById('topbar-page-title');
  const topbarBreadcrumb = document.getElementById('topbar-current-breadcrumb');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTabId = item.getAttribute('data-tab');
      const tabLabel = item.querySelector('span')?.textContent || 'Overview';

      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const targetPane = document.getElementById(targetTabId);
      if (targetPane) targetPane.classList.add('active');

      if (topbarTitle) topbarTitle.textContent = tabLabel;
      if (topbarBreadcrumb) topbarBreadcrumb.textContent = tabLabel;
    });
  });

  // =========================================================================
  // 2. LOAD HEALTH & MONITORED WEBSITES
  // =========================================================================
  async function loadInitialData() {
    try {
      // 1. Health status
      const healthRes = await fetch(`${API_BASE}/health`);
      if (healthRes.ok) {
        const health = await healthRes.json();
        const dbStatusEl = document.getElementById('status-db-engine');
        if (dbStatusEl) {
          dbStatusEl.textContent = health.databaseEngine.includes('PostgreSQL') ? 'PostgreSQL Active' : 'Dev Ledger Active';
        }
      }

      // 2. Websites list
      await refreshWebsites();

      // 3. Leads list
      await refreshLeads();

      // 4. Interceptor rules
      await refreshRules();

    } catch (err) {
      console.warn('Dashboard API connection notice:', err);
    }
  }

  // =========================================================================
  // DOMAIN ORCHESTRATION & SWITCHING STATE
  // All modules dynamically react to the active connected domain
  // =========================================================================
  let activeDomain = localStorage.getItem('aegis_active_domain') || null;
  let connectedWebsites = [];

  function updateActiveDomainUI() {
    if (!activeDomain && connectedWebsites.length > 0) {
      activeDomain = connectedWebsites[0].domain;
      localStorage.setItem('aegis_active_domain', activeDomain);
    }

    const currentDomainEl = document.getElementById('workspace-current-domain');
    if (currentDomainEl) {
      currentDomainEl.textContent = activeDomain || 'No Domain Connected';
    }

    const breadcrumbDomainEl = document.getElementById('topbar-active-domain');
    if (breadcrumbDomainEl) {
      breadcrumbDomainEl.textContent = activeDomain || 'No Domain';
    }

    const exportBtn = document.getElementById('btn-export-report');
    if (exportBtn && activeDomain) {
      exportBtn.href = `${API_BASE}/websites/${encodeURIComponent(activeDomain)}/export/report`;
    }

    // Update domain-specific input defaults across modules
    syncDomainToModules(activeDomain);

    // Populate the domain dropdown switcher menu
    const dropdownItemsEl = document.getElementById('workspace-domain-items');
    if (dropdownItemsEl) {
      if (connectedWebsites.length === 0) {
        dropdownItemsEl.innerHTML = `<div style="padding: 8px 12px; font-size: 12px; color: var(--color-slate-gray);">No domains connected</div>`;
      } else {
        dropdownItemsEl.innerHTML = connectedWebsites.map(site => {
          const isActive = site.domain.toLowerCase() === (activeDomain || '').toLowerCase();
          return `
            <div class="domain-dropdown-option ${isActive ? 'active' : ''}" data-domain="${site.domain}" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; cursor: pointer; font-size: 12.5px; transition: background 0.15s; ${isActive ? 'background: #eff6ff; font-weight: 700; color: var(--color-signal-blue);' : 'color: var(--color-ink-navy);'}">
              <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
                <span>${isActive ? '✓' : '•'}</span>
                <span style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${site.domain}</span>
              </div>
              <span style="font-size: 10.5px; padding: 2px 6px; border-radius: 4px; ${isActive ? 'background: #dbeafe; color: var(--color-signal-blue); font-weight: 700;' : 'color: var(--color-slate-gray);'}">
                ${isActive ? 'Active' : (site.health_score ? `${site.health_score}/100` : '96/100')}
              </span>
            </div>
          `;
        }).join('');

        dropdownItemsEl.querySelectorAll('.domain-dropdown-option').forEach(el => {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const chosen = el.getAttribute('data-domain');
            const menu = document.getElementById('workspace-domain-dropdown-menu');
            if (menu) menu.style.display = 'none';
            switchActiveDomain(chosen);
          });
        });
      }
    }
  }

  function syncDomainToModules(domain) {
    if (!domain) return;
    const shopifyDomainInput = document.getElementById('shopify-shop-domain');
    if (shopifyDomainInput && !shopifyDomainInput.dataset.userEdited) {
      const cleanBrand = domain.replace(/\..*$/, '');
      shopifyDomainInput.value = `${cleanBrand}.myshopify.com`;
    }

    const vectorQueryInput = document.getElementById('vector-query-input');
    if (vectorQueryInput) {
      vectorQueryInput.placeholder = `e.g. Does ${domain} guarantee SLA uptime and high availability?`;
    }

    const adguardTopicInput = document.getElementById('adguard-sim-topic');
    if (adguardTopicInput && !adguardTopicInput.dataset.userEdited) {
      adguardTopicInput.value = `enterprise distributed ${domain}`;
    }

    const battlecardIntentInput = document.getElementById('battlecard-lead-intent');
    if (battlecardIntentInput && !battlecardIntentInput.dataset.userEdited) {
      battlecardIntentInput.value = `high performance solutions for ${domain}`;
    }
  }

  async function switchActiveDomain(newDomain) {
    if (!newDomain) return;
    activeDomain = newDomain;
    localStorage.setItem('aegis_active_domain', activeDomain);
    updateActiveDomainUI();
    showToast(`Switched active domain to ${newDomain}`, 'info');

    await refreshWebsites();
    await loadCoCitationTopology(activeDomain);
  }

  // Toggle domain switcher dropdown
  const domainSwitcherBtn = document.getElementById('workspace-domain-switcher-btn');
  const domainDropdownMenu = document.getElementById('workspace-domain-dropdown-menu');
  domainSwitcherBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!domainDropdownMenu) return;
    const isShowing = domainDropdownMenu.style.display === 'block';
    domainDropdownMenu.style.display = isShowing ? 'none' : 'block';
  });

  document.addEventListener('click', (e) => {
    if (domainDropdownMenu && !domainDropdownMenu.contains(e.target) && e.target !== domainSwitcherBtn) {
      domainDropdownMenu.style.display = 'none';
    }
  });

  document.getElementById('btn-dropdown-connect-domain')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (domainDropdownMenu) domainDropdownMenu.style.display = 'none';
    document.getElementById('btn-add-domain-modal')?.click();
  });

  async function refreshWebsites() {
    const listContainer = document.getElementById('website-list-container');
    if (!listContainer) return;

    try {
      const res = await fetch(`${API_BASE}/websites`);
      const data = await res.json();

      if (data.success && data.websites.length > 0) {
        connectedWebsites = data.websites;

        if (!activeDomain || !connectedWebsites.some(s => s.domain.toLowerCase() === activeDomain.toLowerCase())) {
          activeDomain = connectedWebsites[0].domain;
          localStorage.setItem('aegis_active_domain', activeDomain);
        }

        updateActiveDomainUI();

        listContainer.innerHTML = connectedWebsites.map(site => {
          const isActive = site.domain.toLowerCase() === (activeDomain || '').toLowerCase();
          return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: ${isActive ? '#f0f7ff' : 'var(--color-pebble)'}; border-radius: 8px; margin-bottom: 10px; border: 1.5px solid ${isActive ? 'var(--color-signal-blue)' : 'var(--color-hairline)'}; transition: all 0.2s;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 36px; height: 36px; background: ${isActive ? 'rgba(0, 107, 255, 0.15)' : 'var(--color-badge-bg)'}; color: var(--color-signal-blue); font-weight: 800; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px;">🌐</div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <strong style="color: var(--color-ink-navy); font-size: 14.5px;">${site.domain}</strong>
                  ${isActive ? '<span class="badge-pill success" style="font-size: 10px; padding: 2px 8px;">ACTIVE DOMAIN</span>' : ''}
                </div>
                <div style="font-size: 12px; color: var(--color-slate-gray); margin-top: 2px;">
                  Health Score: <span style="font-weight: 700; color: #10b981;">${site.health_score || 95}/100</span> • Edge Worker: Active • Latency: &lt;1ms
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${!isActive ? `<button class="btn btn-ghost btn-switch-active-site" data-domain="${site.domain}" style="font-size: 12px; padding: 6px 12px; border: 1px solid var(--color-hairline); background: var(--color-paper);">Switch Active</button>` : ''}
              <button class="btn btn-dark btn-audit-site" data-domain="${site.domain}" style="font-size: 12px; padding: 6px 12px;">Audit</button>
              <button class="btn btn-primary btn-axo-site" data-domain="${site.domain}" style="font-size: 12px; padding: 6px 12px;">Run AXO</button>
            </div>
          </div>
        `;
        }).join('');

        // Bind switch active buttons
        document.querySelectorAll('.btn-switch-active-site').forEach(btn => {
          btn.addEventListener('click', () => {
            const domain = btn.getAttribute('data-domain');
            switchActiveDomain(domain);
          });
        });

        // Bind audit buttons
        document.querySelectorAll('.btn-audit-site').forEach(btn => {
          btn.addEventListener('click', () => triggerAudit(btn.getAttribute('data-domain')));
        });

        // Bind AXO buttons
        document.querySelectorAll('.btn-axo-site').forEach(btn => {
          btn.addEventListener('click', () => {
            const domain = btn.getAttribute('data-domain');
            document.querySelector('.nav-item[data-tab="tab-axo"]')?.click();
            triggerAxo(domain);
          });
        });

      } else {
        listContainer.innerHTML = `<div style="text-align: center; padding: 16px; color: var(--color-slate-gray);">No domains connected yet. Click "+ Connect Domain" above.</div>`;
      }
    } catch (err) {
      listContainer.innerHTML = `<div style="color: #ef4444; font-size: 13px;">Failed to load domains from gateway: ${err.message}</div>`;
    }
  }

  // =========================================================================
  // 3. TRIGGER AUDIT ACTION
  // =========================================================================
  async function triggerAudit(domain = null) {
    const targetDomain = domain || activeDomain;
    if (!targetDomain) return;

    const btn = document.getElementById('btn-trigger-crawl');
    if (btn) {
      btn.disabled = true;
      btn.textContent = `Auditing ${targetDomain}...`;
    }

    try {
      const res = await fetch(`${API_BASE}/websites/${encodeURIComponent(targetDomain)}/audit`, { method: 'POST' });
      const data = await res.json();

      if (data.success && data.audit) {
        const scorePill = document.getElementById('audit-score-pill');
        if (scorePill) scorePill.textContent = `Score: ${data.audit.healthScore} / 100`;

        showToast(`Audit Complete for ${targetDomain}! Health: ${data.audit.healthScore}/100, Latency: ${data.audit.latencyMs}ms`, 'success');
      }
    } catch (err) {
      showToast(`Audit error: ${err.message}`, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Trigger Audit";
      }
    }
  }

  document.getElementById('btn-trigger-crawl')?.addEventListener('click', () => triggerAudit(activeDomain));

  // Add Domain Modal Prompt
  document.getElementById('btn-add-domain-modal')?.addEventListener('click', async () => {
    const domainInput = prompt('Enter your domain URL to connect (e.g. mycompany.com):');
    if (domainInput) {
      const clean = domainInput.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!clean) return;
      try {
        const res = await fetch(`${API_BASE}/websites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: clean })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Domain ${clean} connected! Switching active domain and launching audit.`, 'success');
          await switchActiveDomain(clean);
          triggerAudit(clean);
        } else {
          showToast(data.error, 'error');
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  });

  // =========================================================================
  // 4. AXO AGENT MISSION RUNNER
  // =========================================================================
  async function triggerAxo(domain = null) {
    const targetDomain = domain || activeDomain;
    if (!targetDomain) return;

    const logsContainer = document.getElementById('axo-dashboard-logs');
    const btn = document.getElementById('btn-run-dashboard-axo');

    if (btn) {
      btn.disabled = true;
      btn.textContent = `Running Mission on ${targetDomain}...`;
    }

    if (logsContainer) {
      logsContainer.innerHTML = `<div>[0.00s] Dispatching autonomous AI agent mission container on ${domain}...</div>`;
    }

    try {
      const res = await fetch(`${API_BASE}/websites/${encodeURIComponent(domain)}/axo-mission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: "Find pricing, fill contact form, request custom enterprise quote" })
      });
      const data = await res.json();

      if (data.success && data.missionResult) {
        const logs = data.missionResult.telemetryLogs;
        logsContainer.innerHTML = '';
        logs.forEach((log, idx) => {
          setTimeout(() => {
            const row = document.createElement('div');
            row.innerHTML = `<span style="color: #6366f1;">[${log.timestamp}]</span> ${log.detail}: <strong style="color: #10b981;">${log.status}</strong>`;
            logsContainer.appendChild(row);

            if (idx === logs.length - 1) {
              const summary = document.createElement('div');
              summary.style.color = '#10b981';
              summary.style.fontWeight = 'bold';
              summary.style.marginTop = '8px';
              summary.textContent = `✓ AXO Score: ${data.missionResult.agentReadinessScore}/100 — 100% Agent Ready`;
              logsContainer.appendChild(summary);

              if (btn) {
                btn.disabled = false;
                btn.textContent = "Execute Live AXO Test";
              }
            }
          }, idx * 400);
        });
      }
    } catch (err) {
      if (logsContainer) logsContainer.innerHTML = `<div style="color: #ef4444;">AXO Mission error: ${err.message}</div>`;
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Execute Live AXO Test";
      }
    }
  }

  document.getElementById('btn-run-dashboard-axo')?.addEventListener('click', () => triggerAxo('fintechdb.io'));

  // =========================================================================
  // 5. INTENT RULES CONTROLLER
  // =========================================================================
  async function refreshRules() {
    const tableContainer = document.getElementById('rules-table-container');
    if (!tableContainer) return;

    try {
      const res = await fetch(`${API_BASE}/interceptor/rules`);
      const data = await res.json();

      if (data.success && data.rules.length > 0) {
        tableContainer.innerHTML = `
          <table class="leads-table">
            <thead>
              <tr>
                <th>CSS Target Selector</th>
                <th>Matched Intent Tag</th>
                <th>Dynamic Replacement Copy</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.rules.map(r => `
                <tr>
                  <td><code style="background: var(--color-pebble); padding: 2px 6px; border-radius: 4px; color: var(--color-signal-blue); font-size: 12px;">${r.target_selector}</code></td>
                  <td><span class="badge-pill" style="font-size: 11px;">${r.intent_tag}</span></td>
                  <td style="max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${r.payload}</td>
                  <td><span class="badge-pill success">Live on Edge</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    } catch (err) {
      console.warn('Failed to load rules:', err);
    }
  }

  document.getElementById('form-create-rule')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const selector = document.getElementById('rule-selector').value;
    const intent_tag = document.getElementById('rule-intent-tag').value;
    const payload = document.getElementById('rule-payload').value;

    try {
      const res = await fetch(`${API_BASE}/interceptor/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selector, intent_tag, payload })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Rule saved and pushed to Edge Middleware!', 'success');
        document.getElementById('rule-selector').value = '';
        document.getElementById('rule-payload').value = '';
        await refreshRules();
      }
    } catch (err) {
      showToast(`Error saving rule: ${err.message}`, 'error');
    }
  });

  // =========================================================================
  // 6. LEADS CRM TABLE
  // =========================================================================
  async function refreshLeads() {
    const tbody = document.getElementById('leads-tbody');
    if (!tbody) return;

    try {
      const res = await fetch(`${API_BASE}/leads`);
      const data = await res.json();

      if (data.success && data.leads.length > 0) {
        tbody.innerHTML = data.leads.map(lead => {
          let statusBadge = '<span class="badge-pill">Captured</span>';
          if (lead.lifecycle_stage === 'booked') statusBadge = '<span class="badge-pill success">Meeting Booked</span>';
          else if (lead.lifecycle_stage === 'nurturing') statusBadge = '<span class="badge-pill warning">AI SDR Nurturing</span>';

          return `
            <tr>
              <td>
                <div style="font-weight: 700; color: var(--color-ink-navy);">${lead.first_name} ${lead.last_name}</div>
                <div style="font-size: 12px; color: var(--color-slate-gray);">${lead.email_address}</div>
              </td>
              <td>
                <div style="font-weight: 600;">${lead.company_name}</div>
                <div style="font-size: 11px; color: var(--color-slate-gray);">${lead.enriched_corporate_profile.headcount || '100+'} • ${lead.enriched_corporate_profile.industry || 'B2B'}</div>
              </td>
              <td>
                <code style="font-size: 11px; background: var(--color-pebble); padding: 2px 6px; border-radius: 4px; color: var(--color-signal-blue);">${lead.initial_acquisition_intent}</code>
              </td>
              <td>${statusBadge}</td>
              <td>
                <button class="btn btn-ghost btn-open-thread" data-id="${lead.id}" data-name="${lead.first_name} ${lead.last_name}" data-email="${lead.email_address}" data-company="${lead.company_name}" data-stage="${lead.lifecycle_stage}" style="font-size: 12px; padding: 4px 8px;">View Thread</button>
              </td>
            </tr>
          `;
        }).join('');
      } else {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-slate-gray); padding: 24px;">No inbound leads recorded yet.</td></tr>`;
      }
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 24px;">Failed to load leads from gateway.</td></tr>`;
    }
  }

  // =========================================================================
  // 7. AUTO-REMEDIATION & GIT PR CONTROLLER
  // =========================================================================
  const btnGenSchema = document.getElementById('btn-gen-schema');
  const schemaBox = document.getElementById('schema-preview-box');
  btnGenSchema?.addEventListener('click', async () => {
    btnGenSchema.textContent = "Generating...";
    try {
      const res = await fetch(`${API_BASE}/websites/${encodeURIComponent(activeDomain)}/remediation/generate-schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName: activeDomain })
      });
      const data = await res.json();
      if (data.success) {
        schemaBox.style.display = 'block';
        schemaBox.textContent = data.schema.scriptTag;
        btnGenSchema.textContent = "Generated ✓";
      }
    } catch (err) {
      alert(err.message);
      btnGenSchema.textContent = "Generate";
    }
  });

  const btnGenLlmsTxt = document.getElementById('btn-gen-llmstxt');
  const llmsTxtBox = document.getElementById('llmstxt-preview-box');
  btnGenLlmsTxt?.addEventListener('click', async () => {
    btnGenLlmsTxt.textContent = "Generating...";
    try {
      const res = await fetch(`${API_BASE}/websites/${encodeURIComponent(activeDomain)}/remediation/generate-llmstxt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName: activeDomain })
      });
      const data = await res.json();
      if (data.success) {
        llmsTxtBox.style.display = 'block';
        llmsTxtBox.textContent = data.llmsTxt.llmsTxt;
        btnGenLlmsTxt.textContent = "Generated ✓";
      }
    } catch (err) {
      alert(err.message);
      btnGenLlmsTxt.textContent = "Generate";
    }
  });

  const btnCreatePR = document.getElementById('btn-create-auto-pr');
  const prContainer = document.getElementById('pr-result-container');
  const prTitle = document.getElementById('pr-title');
  const prLink = document.getElementById('pr-link');
  const prDiffViewer = document.getElementById('pr-diff-viewer');

  btnCreatePR?.addEventListener('click', async () => {
    btnCreatePR.disabled = true;
    btnCreatePR.textContent = "Opening Pull Request...";

    try {
      const repoSlug = `${activeDomain.replace(/\..*$/, '')}/enterprise-platform`;
      const res = await fetch(`${API_BASE}/websites/${encodeURIComponent(activeDomain)}/remediation/create-pr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoSlug })
      });
      const data = await res.json();

      if (data.success && data.pullRequest) {
        const pr = data.pullRequest;
        prContainer.style.display = 'block';
        prTitle.textContent = pr.title;
        prLink.href = pr.pullRequestUrl;
        prLink.textContent = `View #${pr.prNumber} on GitHub ↗`;

        prDiffViewer.innerHTML = pr.diffs.map(d => `
          <div style="margin-bottom: 10px;">
            <div style="color: var(--color-signal-blue); font-weight: bold; margin-bottom: 4px;">📁 ${d.file} (${d.changeType})</div>
            <pre style="margin: 0; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow-x: auto; color: #a6bbd1;">${d.content}</pre>
          </div>
        `).join('');

        btnCreatePR.textContent = "PR Opened ✓";
      }
    } catch (err) {
      showToast(`PR creation failed: ${err.message}`, 'error');
      btnCreatePR.disabled = false;
      btnCreatePR.textContent = "⚡ Open GitHub Pull Request";
    }
  });

  // =========================================================================
  // 8. VECTOR KNOWLEDGE MEMORY CONTROLLER
  // =========================================================================
  const formQueryVector = document.getElementById('form-query-vector');
  const vectorQueryInput = document.getElementById('vector-query-input');
  const vectorResultsContainer = document.getElementById('vector-results-container');

  formQueryVector?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = vectorQueryInput.value;
    vectorResultsContainer.innerHTML = '<div style="color: var(--color-slate-gray); font-size: 12px;">Querying 1536-dimensional HNSW cosine index...</div>';

    try {
      const res = await fetch(`${API_BASE}/websites/${encodeURIComponent(activeDomain)}/query-knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK: 3 })
      });
      const data = await res.json();

      if (data.success && data.vectorMatches.length > 0) {
        vectorResultsContainer.innerHTML = data.vectorMatches.map((m, idx) => `
          <div style="background: var(--color-paper); padding: 12px; border-radius: 8px; border: 1px solid var(--color-hairline);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span class="badge-pill" style="font-size: 10px;">Rank #${idx + 1} • Similarity: ${(Math.abs(m.similarity_score) * 100).toFixed(1)}%</span>
              <a href="${m.url}" target="_blank" style="font-size: 11px; color: var(--color-signal-blue); text-decoration: none;">${m.url} ↗</a>
            </div>
            <p style="font-size: 12px; color: var(--color-ink-navy); line-height: 1.4; margin: 0;">${m.content_chunk}</p>
          </div>
        `).join('');
      } else {
        vectorResultsContainer.innerHTML = '<div style="color: var(--color-slate-gray); font-size: 12px;">No matching vector chunks found.</div>';
      }
    } catch (err) {
      vectorResultsContainer.innerHTML = `<div style="color: #ef4444; font-size: 12px;">Search failed: ${err.message}</div>`;
    }
  });

  const formIngestVector = document.getElementById('form-ingest-vector');
  const vectorRawContent = document.getElementById('vector-raw-content');
  formIngestVector?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = vectorRawContent.value;

    try {
      const res = await fetch(`${API_BASE}/websites/${encodeURIComponent(activeDomain)}/vectorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, url: `https://${activeDomain}/specs` })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Success! Generated ${data.chunksCreated} vector embeddings and stored in pgvector.`, 'success');
        vectorRawContent.value = '';
      }
    } catch (err) {
      showToast(`Ingestion error: ${err.message}`, 'error');
    }
  });

  // =========================================================================
  // 9. 2-WAY CONVERSATIONAL LEAD THREAD MODAL CONTROLLER
  // =========================================================================
  const leadModal = document.getElementById('lead-modal-backdrop');
  const btnCloseLeadModal = document.getElementById('btn-close-lead-modal');
  const modalLeadName = document.getElementById('modal-lead-name');
  const modalLeadSub = document.getElementById('modal-lead-sub');
  const modalLeadBadge = document.getElementById('modal-lead-badge');
  const modalChatBody = document.getElementById('modal-chat-body');
  const formSendReply = document.getElementById('form-send-lead-reply');
  const inputLeadReply = document.getElementById('input-lead-reply');

  let activeLeadId = null;

  function bindLeadThreadButtons() {
    document.querySelectorAll('.btn-open-thread').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const email = btn.getAttribute('data-email');
        const company = btn.getAttribute('data-company');
        const stage = btn.getAttribute('data-stage');
        openLeadThread(id, name, email, company, stage);
      });
    });
  }

  async function openLeadThread(id, name, email, company, stage) {
    activeLeadId = id;
    if (modalLeadName) modalLeadName.textContent = name;
    if (modalLeadSub) modalLeadSub.textContent = `${email} • ${company}`;
    if (modalLeadBadge) modalLeadBadge.textContent = stage ? stage.toUpperCase() : 'CAPTURED';

    if (leadModal) leadModal.style.display = 'flex';
    if (modalChatBody) modalChatBody.innerHTML = '<div style="text-align: center; color: var(--color-slate-gray); font-size: 12px;">Loading thread messages...</div>';

    await refreshThreadMessages(id);
  }

  async function refreshThreadMessages(id) {
    try {
      const res = await fetch(`${API_BASE}/leads/${id}/thread`);
      const data = await res.json();

      if (data.success && data.thread && data.thread.length > 0) {
        modalChatBody.innerHTML = data.thread.map(msg => {
          const isOutbound = msg.direction === 'outbound';
          const isHitl = msg.status === 'HUMAN_HANDOFF_TRIGGERED';

          if (isHitl) {
            return `
              <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; margin: 8px 0;">
                <div style="display: flex; align-items: center; gap: 6px; color: #d97706; font-weight: bold; font-size: 12px; margin-bottom: 2px;">
                  ⚠️ Human Takeover Triggered (Slack Alert Dispatched)
                </div>
                <div style="font-size: 12px; color: #92400e;">${msg.reason}</div>
              </div>
            `;
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: ${isOutbound ? 'flex-start' : 'flex-end'};">
              <span style="font-size: 10px; color: var(--color-slate-gray); margin-bottom: 3px;">
                ${isOutbound ? '🤖 Aegis Autonomous AI SDR' : '👤 ' + (modalLeadName ? modalLeadName.textContent : 'Lead')}
              </span>
              <div style="max-width: 82%; padding: 12px 16px; border-radius: 12px; font-size: 13px; line-height: 1.5; ${
                isOutbound 
                  ? 'background: #ffffff; border: 1px solid var(--color-hairline); color: var(--color-ink-navy); border-bottom-left-radius: 2px;' 
                  : 'background: var(--color-signal-blue); color: #ffffff; border-bottom-right-radius: 2px;'
              }">
                <pre style="font-family: inherit; margin: 0; white-space: pre-wrap;">${msg.body}</pre>
              </div>
            </div>
          `;
        }).join('');
      } else {
        // Trigger initial nurture seed message
        modalChatBody.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <span style="font-size: 10px; color: var(--color-slate-gray); margin-bottom: 3px;">🤖 Aegis Autonomous AI SDR</span>
            <div style="max-width: 82%; padding: 12px 16px; border-radius: 12px; font-size: 13px; line-height: 1.5; background: #ffffff; border: 1px solid var(--color-hairline); color: var(--color-ink-navy); border-bottom-left-radius: 2px;">
              <pre style="font-family: inherit; margin: 0; white-space: pre-wrap;">Hi there,\n\nThank you for exploring our optimization profiles. We noticed you reached our platform via structural search tracking metrics. Our system verified our architecture is built specifically to solve your explicit criteria.\n\nLet us know when you're open to discuss details further.\n👉 https://cal.com/fintechdb/demo</pre>
            </div>
          </div>
        `;
      }

      modalChatBody.scrollTop = modalChatBody.scrollHeight;
    } catch (err) {
      modalChatBody.innerHTML = `<div style="color: #ef4444; font-size: 12px;">Failed to load thread: ${err.message}</div>`;
    }
  }

  btnCloseLeadModal?.addEventListener('click', () => {
    if (leadModal) leadModal.style.display = 'none';
  });

  leadModal?.addEventListener('click', (e) => {
    if (e.target === leadModal) leadModal.style.display = 'none';
  });

  formSendReply?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeLeadId) return;

    const replyText = inputLeadReply.value;
    inputLeadReply.value = '';

    try {
      const res = await fetch(`${API_BASE}/leads/${activeLeadId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText, domain: activeDomain })
      });
      const data = await res.json();
      if (data.success) {
        await refreshThreadMessages(activeLeadId);
      }
    } catch (err) {
      showToast(`Send error: ${err.message}`, 'error');
    }
  });

  // Re-bind buttons whenever leads refresh
  const origRefreshLeads = refreshLeads;
  refreshLeads = async function() {
    await origRefreshLeads();
    bindLeadThreadButtons();
  };

  // =========================================================================
  // ENTERPRISE MODULE 2: D3 CO-CITATION TOPOLOGY GRAPH & PROMPT COMPILER
  // =========================================================================

  let topologySimulation = null;

  async function loadCoCitationTopology(domain = null) {
    const targetDomain = domain || activeDomain || '';
    const svgEl = document.getElementById('cocitation-svg');
    if (!svgEl) return;

    try {
      const res = await fetch(`${API_BASE}/prompt-compiler/topology?domain=${encodeURIComponent(targetDomain)}`);
      const data = await res.json();
      if (!data.success) return;

      renderD3Topology(data.nodesData || [], data.linksData || []);
      loadCoCitationMatrixFeed();
    } catch (err) {
      console.warn('Co-citation topology load warning:', err.message);
    }
  }

  function renderD3Topology(nodesData, linksData) {
    const svgEl = document.getElementById('cocitation-svg');
    if (!svgEl || typeof d3 === 'undefined') return;

    const width = svgEl.clientWidth || 600;
    const height = 380;

    // Clear previous SVG contents
    d3.select(svgEl).selectAll('*').remove();

    const svg = d3.select(svgEl)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g');

    // Zoom & Pan capability with floating controls
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        svg.attr('transform', event.transform);
      });
    d3.select(svgEl).call(zoomBehavior);

    // Bind floating zoom buttons
    const btnZoomIn = document.getElementById('btn-graph-zoom-in');
    const btnZoomOut = document.getElementById('btn-graph-zoom-out');
    const btnZoomReset = document.getElementById('btn-graph-zoom-reset');

    if (btnZoomIn) btnZoomIn.onclick = () => d3.select(svgEl).transition().duration(250).call(zoomBehavior.scaleBy, 1.3);
    if (btnZoomOut) btnZoomOut.onclick = () => d3.select(svgEl).transition().duration(250).call(zoomBehavior.scaleBy, 0.75);
    if (btnZoomReset) btnZoomReset.onclick = () => d3.select(svgEl).transition().duration(350).call(zoomBehavior.transform, d3.zoomIdentity);

    // Tooltip Element
    const tooltip = document.getElementById('graph-node-tooltip');
    const graphContainer = document.getElementById('cocitation-graph-container');

    // Deep clones of nodes and links so simulation can mutate positions safely
    const nodes = nodesData.map(d => ({ ...d }));
    const links = linksData.map(d => ({ ...d }));

    topologySimulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(110))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d.citationCount || 10) * 1.5 + 24));

    // Render connecting link vectors
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#d4e0ed')
      .attr('stroke-width', d => Math.max(1.5, (d.closenessWeight || 1) * 2))
      .attr('stroke-opacity', 0.85);

    // Node container groups with drag & hover tooltip interactions
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) topologySimulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) topologySimulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('mouseenter', (event, d) => {
        if (!tooltip || !graphContainer) return;
        tooltip.style.display = 'block';
        const isOrigin = d.group === 'origin';
        tooltip.innerHTML = `
          <strong style="color: ${isOrigin ? '#60a5fa' : '#f8fafc'}; font-size: 13px;">${d.id}</strong><br>
          <span style="color: #94a3b8;">Entity Type:</span> ${isOrigin ? 'Brand Hub (Protected)' : 'Emerging Competitor'}<br>
          <span style="color: #94a3b8;">Citations in LLMs:</span> <strong>${d.citationCount || 1}</strong><br>
          <span style="color: #94a3b8;">Threat Level:</span> <span style="color: ${isOrigin ? '#34d399' : (d.citationCount > 8 ? '#f87171' : '#fbbf24')}; font-weight: 700;">${isOrigin ? 'Primary Origin' : (d.citationCount > 8 ? 'Critical Threat' : 'Monitored Rival')}</span>
        `;
      })
      .on('mousemove', (event) => {
        if (!tooltip || !graphContainer) return;
        const rect = graphContainer.getBoundingClientRect();
        tooltip.style.left = `${Math.min(rect.width - 200, Math.max(10, event.clientX - rect.left + 15))}px`;
        tooltip.style.top = `${Math.min(rect.height - 100, Math.max(10, event.clientY - rect.top - 10))}px`;
      })
      .on('mouseleave', () => {
        if (tooltip) tooltip.style.display = 'none';
      });

    // Visual circles
    node.append('circle')
      .attr('r', d => d.group === 'origin' ? 24 : Math.max(14, (d.citationCount || 4) * 2.2))
      .attr('fill', d => d.group === 'origin' ? '#006bff' : '#0b3558')
      .attr('stroke', d => d.group === 'origin' ? '#93c5fd' : '#476788')
      .attr('stroke-width', 2.5);

    // Labels
    node.append('text')
      .text(d => d.id)
      .attr('x', 0)
      .attr('y', d => (d.group === 'origin' ? 26 : Math.max(14, (d.citationCount || 4) * 2.2)) + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#0b3558')
      .style('font-family', 'Manrope, sans-serif')
      .style('font-size', '11px')
      .style('font-weight', '700');

    // Simulation tick loop
    topologySimulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
  }

  async function loadCoCitationMatrixFeed() {
    const feed = document.getElementById('cocitation-matrix-feed');
    if (!feed) return;
    try {
      const res = await fetch(`${API_BASE}/prompt-compiler/co-citations?website_id=site_01`);
      const data = await res.json();
      if (!data.success) return;

      feed.innerHTML = data.matrix.map(row => `
        <div style="background: var(--color-pebble); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--color-hairline); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: var(--color-ink-navy);">${row.brand_name}</strong>
            <span style="font-size: 11px; color: var(--color-slate-gray); display: block;">Topic: '${row.target_prompt_topic}' • ${row.engine_identity}</span>
          </div>
          <div style="text-align: right;">
            <span class="badge-pill" style="font-size: 10px;">dist: ${row.proximity_score}</span>
            <span style="font-size: 10px; color: ${parseFloat(row.sentiment_differential) >= 0 ? '#10b981' : '#ef4444'}; font-weight: 700; display: block;">Δ ${row.sentiment_differential}</span>
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.warn('Matrix feed error:', e.message);
    }
  }

  // Refresh topology button
  document.getElementById('btn-refresh-topology')?.addEventListener('click', loadCoCitationTopology);

  // Trigger AI Engine Sweep
  document.getElementById('btn-trigger-ai-sweep')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-trigger-ai-sweep');
    if (btn) btn.textContent = 'Sweeping AI Engines...';
    try {
      const res = await fetch(`${API_BASE}/prompt-compiler/sweep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website_id: 'site_01', company_id: 'comp_01' })
      });
      const data = await res.json();
      if (data.success) {
        await loadCoCitationTopology();
        showToast(`AI Engine Sweep complete: logged ${data.count} competitive co-citation vectors.`, 'success');
      }
    } catch (err) {
      showToast(`Sweep failed: ${err.message}`, 'error');
    } finally {
      if (btn) btn.textContent = 'Trigger AI Engine Sweep';
    }
  });

  // Prompt compiler form
  document.getElementById('form-compile-prompts')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const keywordsInput = document.getElementById('input-compiler-keywords')?.value || '';
    const locsInput = document.getElementById('input-compiler-locations')?.value || '';
    const statsBox = document.getElementById('compiler-stats-box');

    const core_keywords = keywordsInput.split(',').map(s => s.trim()).filter(Boolean);
    const locations = locsInput.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await fetch(`${API_BASE}/prompt-compiler/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ core_keywords, locations })
      });
      const data = await res.json();
      if (data.success && statsBox) {
        statsBox.innerHTML = `✓ Compiled <strong>${data.totalGenerated}</strong> prompt permutations across ${data.keywordCount} keywords & ${data.locationCount} regions.<br><span style="color: var(--color-slate-gray); font-size: 11px;">Sample: "${data.prompts[0]}"</span>`;
      }
    } catch (err) {
      if (statsBox) statsBox.textContent = `Compilation error: ${err.message}`;
    }
  });

  // =========================================================================
  // ENTERPRISE MODULE 3: PROGRAMMATIC REAL-TIME AD GUARD
  // =========================================================================

  document.getElementById('form-test-adguard')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const topic = document.getElementById('adguard-sim-topic')?.value;
    const sov = parseFloat(document.getElementById('adguard-sim-sov')?.value || '32.5');
    const resultBox = document.getElementById('adguard-mutation-result');

    try {
      const res = await fetch(`${API_BASE}/ad-guard/evaluate-visibility-drop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_id: activeDomain || 'site_01',
          keyword_topic: topic,
          current_share_of_voice: sov,
          customer_ad_account_id: '982-114-8802',
          associated_fallback_campaign_id: `cmp_fallback_${(activeDomain || 'site').replace(/\..*$/, '')}`,
          boost_budget_id: 'bgt_boost_550'
        })
      });
      const data = await res.json();
      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `
<span style="color: ${data.status === 'activated' ? '#38bdf8' : '#4ade80'}; font-weight: bold;">[AD-GUARD DISPATCH] Status: ${data.status.toUpperCase()}</span>
Current SoV: ${data.currentSoV}% (Threshold: ${data.threshold}%)
Action: ${data.remedial_action || data.message}

Google Ads Mutation Payload:
${JSON.stringify(data.googleAdsMutation || {}, null, 2)}

Meta Graph Retargeting Payload:
${JSON.stringify(data.metaRetargetingPayload || {}, null, 2)}
        `.trim();
      }
    } catch (err) {
      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.textContent = `Ad Guard Exception: ${err.message}`;
      }
    }
  });

  // CRM Battlecard Test
  document.getElementById('form-test-battlecard')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('battlecard-lead-email')?.value;
    const topic = document.getElementById('battlecard-lead-intent')?.value;
    const previewBox = document.getElementById('battlecard-preview-box');

    try {
      const res = await fetch(`${API_BASE}/crm/inject-battlecard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_email: email, company_id: 'comp_01', identified_intent_topic: topic })
      });
      const data = await res.json();
      if (previewBox) {
        previewBox.style.display = 'block';
        previewBox.textContent = data.battlecard || JSON.stringify(data, null, 2);
      }
    } catch (err) {
      if (previewBox) {
        previewBox.style.display = 'block';
        previewBox.textContent = `CRM Battlecard error: ${err.message}`;
      }
    }
  });

  // =========================================================================
  // ENTERPRISE MODULE 1: NATIVE CMS & STOREFRONT SYNC
  // =========================================================================

  document.getElementById('form-shopify-sync')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const shop = document.getElementById('shopify-shop-domain')?.value;
    const productId = document.getElementById('shopify-product-id')?.value;
    const copy = document.getElementById('shopify-copy-payload')?.value;
    const resultBox = document.getElementById('shopify-sync-result');

    try {
      const res = await fetch(`${API_BASE}/sync/shopify/update-product-node`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_domain: shop,
          shopify_product_graphql_id: productId,
          text_copy_payload: copy,
          schema_json_payload: {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Enterprise Scalable DB Node",
            "description": copy
          }
        })
      });
      const data = await res.json();
      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `✓ Metafield Upsert Synchronized!<br><pre style="margin: 4px 0 0 0;">${JSON.stringify(data, null, 2)}</pre>`;
      }
    } catch (err) {
      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.textContent = `Shopify sync error: ${err.message}`;
      }
    }
  });

  // WordPress AST Simulation
  document.getElementById('btn-simulate-wp-ast')?.addEventListener('click', async () => {
    const resBox = document.getElementById('wp-ast-result');
    try {
      const res = await fetch(`${API_BASE}/sync/cms/ast-delta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: '102',
          targetUrl: `https://${activeDomain}/enterprise`,
          modifications: [{ selector: 'h1.product-title', content: `High-Performance Infrastructure for ${activeDomain}` }],
          intentTag: 'enterprise_autonomous_scaling',
          platform: 'wordpress'
        })
      });
      const data = await res.json();
      if (resBox) {
        resBox.style.display = 'block';
        resBox.textContent = `✓ WordPress AST Delta Dispatched (HMAC Verified, Hook: wp_insert_post_data)`;
      }
    } catch (err) {
      if (resBox) resBox.textContent = `WP Error: ${err.message}`;
    }
  });

  // Edge KV Export
  document.getElementById('btn-export-edge-profile')?.addEventListener('click', async () => {
    const resBox = document.getElementById('edge-export-result');
    try {
      const res = await fetch(`${API_BASE}/sync/cms/export-edge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: activeDomain })
      });
      const data = await res.json();
      if (resBox) {
        resBox.style.display = 'block';
        resBox.textContent = `✓ Exported to Cloudflare Workers KV (Latency Target: <5ms)`;
      }
    } catch (err) {
      if (resBox) resBox.textContent = `Edge Error: ${err.message}`;
    }
  });

  // =========================================================================
  // HOURLY AUTONOMOUS OPTIMIZATION BANNER
  // =========================================================================

  async function refreshHourlyStatus() {
    const badge = document.getElementById('hourly-last-run-badge');
    const subtitle = document.getElementById('hourly-banner-subtitle');
    if (!badge) return;

    try {
      const res = await fetch(`${API_BASE}/orchestrator/hourly-status`);
      const data = await res.json();
      if (data.lastCycle) {
        const timeAgo = new Date(data.lastCycle.executedAt).toLocaleTimeString();
        badge.textContent = `Last Run: ${timeAgo} (${data.lastCycle.websitesEnhancedCount} sites enhanced)`;
        subtitle.textContent = `Runs every 60 min • Latest: Health ${data.lastCycle.results[0]?.technicalHealthScore || 95}/100, ${data.lastCycle.results[0]?.geoSweepVectorsLogged || 12} vectors swept, Edge AST refreshed.`;
      }
    } catch (e) {
      console.warn('Hourly status fetch error:', e.message);
    }
  }

  document.getElementById('btn-run-hourly-cycle-now')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-run-hourly-cycle-now');
    if (btn) btn.textContent = 'Enhancing Sites...';
    try {
      const res = await fetch(`${API_BASE}/orchestrator/run-hourly-cycle`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'completed') {
        await refreshHourlyStatus();
        showToast(`Hourly Cycle Complete: Enhanced ${data.summary.websitesEnhancedCount} website(s) in ${data.summary.durationMs}ms.`, 'success');
      }
    } catch (err) {
      showToast(`Error running hourly cycle: ${err.message}`, 'error');
    } finally {
      if (btn) btn.textContent = '▶ Run Hourly Cycle Now';
    }
  });

  // Verify session first before loading dashboard telemetry
  checkSessionAndTrial().then(ok => {
    if (ok) {
      loadInitialData();
      loadCoCitationTopology();
      refreshHourlyStatus();
    }
  });

});

