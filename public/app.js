(() => {
  // ===== Socket.IO: notificación de pago =====
  const socket = io({ path: '/tbk-app-node/socket.io' });

  socket.on('pago_notificacion', (data) => {
    console.log('Notificación:', data);
    const body = document.querySelector('.texto-enviando');
    const notif = data?.data?.notification || {};
     const contenido = `
        "terminalID": "${notif.terminalID}",
        "monto": "${notif.monto}",
        "fechaHoraTransaccion": "${notif.fechaTransaccion} ${notif.horaTransaccion}",
        "ultimos4DigitosTarjeta": "${notif.ultimos4DigitosTarjeta}"
      `;

    body.innerHTML =
      '📨 Notificación de PAGO:<br>' +
      `<textarea readonly class="form-control font-monospace" rows="8"
                 style="white-space:pre;font-size:0.85rem;">${contenido}</textarea>`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEnviando')).show();
  });

  // ===== Dropdown terminal =====
  document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('dropdownTerminal').innerHTML = item.innerHTML;
    });
  });

  // ===== Helpers =====
  function generarTransactionId() {
    const guid = crypto.randomUUID();
    const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TX-${guid}-${rand}`;
  }
  function getTerminalId() {
    const txt = document.getElementById('dropdownTerminal').innerText.trim();
    return txt.split('-')[1]?.trim() || '';
  }
  function mustSelectValidTerminal(terminalId) {
    if (!terminalId || terminalId.length < 5) {
      alert('❌ Debes seleccionar un terminal válido.');
      const btn = document.getElementById('dropdownTerminal');
      btn.classList.add('input-alert');
      setTimeout(() => btn.classList.remove('input-alert'), 2000);
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  }

  // ===== Pago =====
  document.querySelector('.btn-pagar').addEventListener('click', async (e) => {
    e.preventDefault();

    const montoInput = document.querySelector('input[type=number]');
    const terminalId = getTerminalId();

    if (!montoInput.value || parseInt(montoInput.value) <= 0) {
      alert('❌ Debes ingresar un monto válido.');
      montoInput.focus(); montoInput.select();
      return;
    }
    if (!mustSelectValidTerminal(terminalId)) return;

    const payload = {
      commerceCode: window.COMMERCE_CODE,
      terminalId,
      transactionHostId: generarTransactionId(),
      urlNotify: window.URL_NOTIFY,
      totalPayment: parseInt(montoInput.value)
    };

    console.log('[Payload enviado]', payload);

    try {
      const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEnviando'));
      const res = await fetch('api/pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Client-Id': '1' },
        body: JSON.stringify(payload)
      });

      if (res.status === 200) {
        document.querySelector('.texto-enviando').innerText = '✅ Solicitud enviada correctamente.';
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary mt-3';
        btn.innerText = 'Aceptar';
        btn.onclick = () => location.reload();
        const modalBody = document.querySelector('#modalEnviando .modal-body');
        if (!modalBody.querySelector('.btn-primary')) modalBody.appendChild(btn);
        modal.show();
      } else {
        const data = await res.json();
        if (res.status === 422) {
          const detalle = data?.errors?.[0]?.detail || '❌ Error 422 desconocido.';
          document.querySelector('.texto-enviando').innerText = `⚠️ ${detalle}`;
          const btn = document.createElement('button');
          btn.className = 'btn btn-primary mt-3';
          btn.innerText = 'Aceptar';
          btn.onclick = () => location.reload();
          const modalBody = document.querySelector('#modalEnviando .modal-body');
          if (!modalBody.querySelector('.btn-primary')) modalBody.appendChild(btn);
          modal.show();
        } else {
          alert('Respuesta:\n' + JSON.stringify(data, null, 2));
        }
      }
    } catch (err) {
      alert('Error al procesar el pago:\n' + err.message);
    }
  });

  // ===== Modal comprobante (abrir) =====
  const modalComprobante = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalComprobante'));
  document.querySelector('.btn-imprimir').addEventListener('click', (e) => {
    e.preventDefault();
    modalComprobante.show();
  });

  // ===== Enviar a impresión =====
  document.getElementById('btnEnviarImpresion').addEventListener('click', async (e) => {
    e.preventDefault();

    const message = document.getElementById('textoComprobante').value.trim();
    const terminalId = getTerminalId();

    if (!message) return alert('❌ El texto del comprobante está vacío.');
    if (!mustSelectValidTerminal(terminalId)) { modalComprobante.hide(); return; }

    const payload = {
      commerceCode: window.COMMERCE_CODE,
      terminalId,
      transactionHostId: generarTransactionId(),
      type: 'text',
      message
    };

    console.log('[Payload impresión]', payload);

    try {
      const res = await fetch('api/impresion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Client-Id': '1' },
        body: JSON.stringify(payload)
      });

      if (res.status === 204 || res.status === 200) {
        alert('✅ Solicitud enviada correctamente.');
        modalComprobante.hide();
      } else {
        const data = await res.json();
        alert('Respuesta:\n' + JSON.stringify(data, null, 2));
      }
    } catch (err) {
      alert('❌ Error al enviar impresión: ' + err.message);
    }
  });
})();
