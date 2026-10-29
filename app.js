/**
 * Aegis Growth OS — Interactive Client Logic
 * Strict adherence to Calendly design system ("Navy ink on cool marble")
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. DYNAMIC INTENT INTERCEPTOR SIMULATION
  // =========================================================================
  const intentData = {
    fintech: {
      badge: "Target Match: Enterprise Fintech Scalability (Perplexity Ref)",
      headline: "The Low-Latency Distributed Database Built for Enterprise Fintech Scaling.",
      subcopy: "Engineered with sub-millisecond replication, strict ACID compliance, and zero downtime failover for high-frequency financial institutions.",
      placeholder: "Enter corporate email to review fintech benchmark studies",
      buttonText: "Request Benchmark"
    },
    cost: {
      badge: "Target Match: Cloud Cost Optimization (ChatGPT Ref)",
      headline: "Cut Cloud Database Infrastructure TCO by 62% Without Sacrificing Performance.",
      subcopy: "Consolidate sprawling clusters into an ultra-dense, vector-native storage engine designed for predictable budget efficiency at scale.",
      placeholder: "Enter corporate email to calculate your custom ROI reduction",
      buttonText: "Calculate ROI Lift"
    },
    developer: {
      badge: "Target Match: Developer API Simplicity (Google AIO Ref)",
      headline: "Zero-Boilerplate SQL & Vector APIs Built for High-Velocity Product Teams.",
      subcopy: "Spin up production-ready read/write replicas in 3 seconds with type-safe client libraries and native pgvector acceleration.",
      placeholder: "Enter work email to receive instantaneous API test keys",
      buttonText: "Get Free API Keys"
    }
  };

  const simButtons = document.querySelectorAll('.sim-btn[data-intent]');
  const simBadge = document.getElementById('sim-badge');
  const simHeadline = document.getElementById('sim-headline');
  const simSubcopy = document.getElementById('sim-subcopy');
  const simInput = document.getElementById('sim-input');
  const simSubmitBtn = document.getElementById('sim-submit-btn');

  simButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      simButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const intentKey = btn.getAttribute('data-intent');
      const data = intentData[intentKey];
      if (!data) return;

      // Smooth opacity transition for realistic zero-CLS edge swap demo
      simHeadline.style.opacity = '0';
      simSubcopy.style.opacity = '0';

      setTimeout(() => {
        simBadge.textContent = data.badge;
        simHeadline.textContent = data.headline;
        simSubcopy.textContent = data.subcopy;
        simInput.placeholder = data.placeholder;
        simSubmitBtn.textContent = data.buttonText;

        simHeadline.style.opacity = '1';
        simSubcopy.style.opacity = '1';
      }, 150);
    });
  });


  // =========================================================================
  // 2. AXO (AGENT EXPERIENCE OPTIMIZATION) LIVE SANDBOX SIMULATOR
  // =========================================================================
  const btnRunAxo = document.getElementById('btn-run-axo-sim');
  const axoStatus = document.getElementById('axo-live-status');
  const terminalStream = document.getElementById('terminal-stream');

  btnRunAxo?.addEventListener('click', () => {
    btnRunAxo.disabled = true;
    btnRunAxo.textContent = "Agent Executing Mission...";
    axoStatus.textContent = "Agent Active (Chromium)";
    axoStatus.className = "badge-pill warning";

    terminalStream.innerHTML = `
      <div class="axo-step">
        <span>[0.00s] Initializing Chromium Headless Instance with stealth evasion</span>
        <span class="axo-status-pass">RUNNING...</span>
      </div>
    `;

    const steps = [
      { time: "0.45s", log: "[DOM-CHECK] Validating /llms.txt and /llms-full.txt discovery endpoints", status: "200 OK" },
      { time: "0.90s", log: "[SECURITY] Evaluating cloud proxy challenge & anti-bot traps", status: "BYPASS (0 traps)" },
      { time: "1.40s", log: "[SELECTOR] Scanning semantic form attributes: input[type='email']", status: "FOUND (#email-input)" },
      { time: "1.95s", log: "[INTERACTION] Simulated human typing: agent.buyer@enterprisecorp.com", status: "SUCCESS" },
      { time: "2.40s", log: "[ACTION] Clicking primary submission CTA: button#request-quote", status: "INTERACTABLE (180ms)" },
      { time: "2.90s", log: "[RESULT] Mission Completed. AXO Machine Buyer Score: 98/100", status: "VERIFIED COMPLIANT" }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        const stepEl = document.createElement('div');
        stepEl.className = 'axo-step';
        stepEl.innerHTML = `
          <span>[${step.time}] ${step.log}</span>
          <span class="axo-status-pass">${step.status}</span>
        `;
        terminalStream.appendChild(stepEl);

        if (index === steps.length - 1) {
          axoStatus.textContent = "100% Agent Ready";
          axoStatus.className = "badge-pill success";
          btnRunAxo.disabled = false;
          btnRunAxo.textContent = "Re-Run Agent Audit";
        }
      }, (index + 1) * 500);
    });
  });


  // =========================================================================
  // 3. CALENDLY-STYLE EMBEDDED SCHEDULER LOGIC
  // =========================================================================
  const calDays = document.querySelectorAll('.cal-day-cell:not(.muted)');
  const slotButtons = document.querySelectorAll('.slot-btn');
  const selectedSlotPreview = document.getElementById('selected-slot-preview');
  const btnConfirmSlot = document.getElementById('btn-confirm-slot');

  let currentSelectedDay = "Wednesday, Nov 4";
  let currentSelectedTime = "09:30 AM";

  calDays.forEach(cell => {
    cell.addEventListener('click', () => {
      calDays.forEach(c => c.classList.remove('active'));
      cell.classList.add('active');
      const dayNum = cell.textContent.trim();
      currentSelectedDay = `November ${dayNum}, 2026`;
      updateSlotPreview();
    });
  });

  slotButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      slotButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentSelectedTime = btn.getAttribute('data-time') || btn.textContent.trim();
      updateSlotPreview();
    });
  });

  function updateSlotPreview() {
    if (selectedSlotPreview) {
      selectedSlotPreview.textContent = `Selected: ${currentSelectedDay} @ ${currentSelectedTime}`;
    }
  }

  btnConfirmSlot?.addEventListener('click', () => {
    btnConfirmSlot.textContent = "Booking Confirmed ✓";
    btnConfirmSlot.style.backgroundColor = "var(--color-success)";
    setTimeout(() => {
      btnConfirmSlot.textContent = "Confirm Meeting";
      btnConfirmSlot.style.backgroundColor = "";
    }, 3000);
  });


  // =========================================================================
  // 4. RETINA CANVAS DUAL-CURVE ATTRIBUTION CHART
  // =========================================================================
  const canvas = document.getElementById('attributionChart');
  if (canvas) {
    const ctx = canvas.getContext('2d');

    // Chart dataset configurations
    const datasets = {
      '7d': {
        labels: ['Oct 23', 'Oct 24', 'Oct 25', 'Oct 26', 'Oct 27', 'Oct 28', 'Oct 29'],
        clicks: [1200, 1350, 1100, 1420, 1680, 1550, 1890],
        citations: [140, 185, 190, 245, 310, 295, 420],
        conversions: [45, 62, 58, 89, 112, 98, 145]
      },
      '30d': {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        clicks: [5800, 7200, 8900, 11400],
        citations: [680, 940, 1420, 2150],
        conversions: [180, 290, 480, 780]
      },
      '90d': {
        labels: ['Month 1 (Audit)', 'Month 2 (GEO Lift)', 'Month 3 (Revenue Engine)'],
        clicks: [12400, 24800, 48900],
        citations: [450, 2800, 8900],
        conversions: [95, 840, 2850]
      }
    };

    let activeRange = '7d';

    function renderChart(rangeKey) {
      const data = datasets[rangeKey];
      if (!data) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const padding = { top: 20, right: 30, bottom: 35, left: 50 };

      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle horizontal grid lines
      const gridSteps = 4;
      ctx.strokeStyle = '#e6edf5';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#839cb5';
      ctx.font = '11px Manrope, sans-serif';

      for (let i = 0; i <= gridSteps; i++) {
        const y = padding.top + (chartH / gridSteps) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }

      const numPoints = data.labels.length;
      const stepX = chartW / (numPoints - 1 || 1);

      // Max values for normalization
      const maxClicks = Math.max(...data.clicks) * 1.15;
      const maxCitations = Math.max(...data.citations) * 1.25;

      // 1. Draw Organic Clicks Bars (Ink Navy with opacity)
      const barWidth = Math.min(32, stepX * 0.35);
      data.clicks.forEach((val, idx) => {
        const x = padding.left + (idx * stepX) - (barWidth / 2);
        const barH = (val / maxClicks) * chartH;
        const y = padding.top + chartH - barH;

        ctx.fillStyle = 'rgba(11, 53, 88, 0.2)';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
        ctx.fill();
      });

      // 2. Draw Citations Curve (Signal Blue #006bff)
      ctx.strokeStyle = '#006bff';
      ctx.lineWidth = 3;
      ctx.beginPath();

      const citationPoints = data.citations.map((val, idx) => {
        const x = padding.left + idx * stepX;
        const y = padding.top + chartH - (val / maxCitations) * chartH;
        return { x, y };
      });

      citationPoints.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else {
          const prev = citationPoints[idx - 1];
          const cpX1 = prev.x + (pt.x - prev.x) / 2;
          const cpX2 = cpX1;
          ctx.bezierCurveTo(cpX1, prev.y, cpX2, pt.y, pt.x, pt.y);
        }
      });
      ctx.stroke();

      // Draw active citation dots
      citationPoints.forEach(pt => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#006bff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });

      // 3. Draw Zero-Click Conversions Curve (Cyan #0284c7, dashed)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();

      data.conversions.forEach((val, idx) => {
        const x = padding.left + idx * stepX;
        const y = padding.top + chartH - (val / maxCitations) * chartH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Draw X-axis labels
      ctx.fillStyle = '#476788';
      ctx.textAlign = 'center';
      data.labels.forEach((label, idx) => {
        const x = padding.left + idx * stepX;
        ctx.fillText(label, x, height - 10);
      });
    }

    renderChart(activeRange);

    // Timeframe button event bindings
    const rangeBtns = [
      { id: 'btn-range-7d', key: '7d' },
      { id: 'btn-range-30d', key: '30d' },
      { id: 'btn-range-90d', key: '90d' }
    ];

    rangeBtns.forEach(item => {
      const btn = document.getElementById(item.id);
      btn?.addEventListener('click', () => {
        rangeBtns.forEach(b => document.getElementById(b.id)?.classList.remove('active'));
        btn.classList.add('active');
        activeRange = item.key;
        renderChart(activeRange);
      });
    });

    window.addEventListener('resize', () => renderChart(activeRange));
  }


  // =========================================================================
  // 5. SMOOTH NAV SCROLLING & OAUTH BUTTON NOTIFICATION
  // =========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  document.getElementById('btn-oauth-google')?.addEventListener('click', () => {
    alert("Initiating Google OAuth 2.0 PKCE Handshake with Aegis Credential Vault...\nPermissions requested: Google Search Console (read-only) & GA4.");
  });

  document.getElementById('btn-oauth-ms')?.addEventListener('click', () => {
    alert("Initiating Microsoft OAuth Handshake with Aegis Credential Vault...\nPermissions requested: Bing Webmaster Tools.");
  });

});
