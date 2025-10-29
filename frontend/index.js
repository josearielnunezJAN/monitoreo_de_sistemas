const socket = io('http://192.168.1.10:3000');

socket.on('connect', () => {
  console.log('🟢 Conectado al servidor de monitoreo');
});

socket.on('disconnect', () => {
  console.log('🔴 Desconectado del servidor');
});

// Escucha los datos enviados desde el backend
socket.on('datosSistema', (datos) => {
  // ===== CPU =====
  const cpu = datos.cpu;
  document.getElementById('cpuFabricante').textContent = cpu.fabricante;
  document.getElementById('cpuModelo').textContent = cpu.modelo;
  document.getElementById('cpuNucleos').textContent = cpu.nucleos;
  document.getElementById('cpuTemp').textContent = cpu.temperatura;

  // ===== MEMORIA =====
  const memoria = datos.memoria;
  document.getElementById('memTotal').textContent = memoria.total;
  document.getElementById('memUsado').textContent = memoria.usado;
  document.getElementById('memLibre').textContent = memoria.libre;

  // Cálculo visual de porcentaje
  const totalGB = parseFloat(memoria.total);
  const usadoGB = parseFloat(memoria.usado);
  const memPercent = ((usadoGB / totalGB) * 100).toFixed(1);
  const memBar = document.getElementById('memProgress');
  memBar.style.width = `${memPercent}%`;
  memBar.textContent = `${memPercent}%`;

  // ===== DISCOS =====
  const particiones = datos.particiones;
  if (particiones.sda1) {
    const sda1 = particiones.sda1;
    document.getElementById('discoTotal').textContent = sda1.tamaño;
    document.getElementById('discoUsado').textContent = sda1.usado;
    document.getElementById('discoLibre').textContent = sda1.libre;

    const uso = parseFloat(sda1.usoPorcentaje);
    const discoBar = document.getElementById('discoProgress');
    discoBar.style.width = `${uso}%`;
    discoBar.textContent = `${uso}%`;
  }

  // ===== INTERFACES DE RED =====
  const tabla = document.getElementById('tablaRed');
  tabla.innerHTML = ''; // Limpia contenido previo

  datos.red.forEach((iface) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${iface.interfaz}</td>
      <td>${iface.ip4 || '-'}</td>
      <td>${iface.mac || '-'}</td>
      <td>${iface.recibidoMB}</td>
      <td>${iface.enviadoMB}</td>
    `;
    tabla.appendChild(fila);
  });
});
