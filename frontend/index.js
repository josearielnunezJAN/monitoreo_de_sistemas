const socket = io('http://192.168.1.10:3000');

socket.on('connect', () => {
  console.log('🟢 Conectado al servidor de monitoreo');
});

socket.on('disconnect', () => {
  console.log('🔴 Desconectado del servidor');
});

// Función para cambiar color de barra según porcentaje
function setProgressColor(bar, percent) {
  bar.classList.remove('bg-success','bg-warning','bg-danger');
  if(percent < 60) bar.classList.add('bg-success');
  else if(percent < 85) bar.classList.add('bg-warning');
  else bar.classList.add('bg-danger');
}

// Escucha los datos enviados desde el backend
socket.on('datosSistema', (datos) => {
  // ===== CPU =====
  const cpu = datos.cpu;
  document.getElementById('cpuFabricante').textContent = cpu.fabricante;
  document.getElementById('cpuModelo').textContent = cpu.modelo;
  document.getElementById('cpuNucleos').textContent = cpu.nucleos;
  document.getElementById('cpuVelocidad').textContent = cpu.velocidadActual;
  document.getElementById('cpuVelMax').textContent = cpu.velocidadMaxima;
  document.getElementById('cpuCarga').textContent = cpu.cargaPromedio;
  document.getElementById('cpuTemp').textContent = cpu.temperatura;

  const cpuPercent = parseFloat(cpu.cargaPromedio);
  const cpuBar = document.getElementById('cpuProgress');
  cpuBar.style.width = `${cpuPercent}%`;
  cpuBar.textContent = `${cpuPercent}%`;
  setProgressColor(cpuBar, cpuPercent);

  // ===== MEMORIA =====
  const memoria = datos.memoria;
  document.getElementById('memTotal').textContent = memoria.total;
  document.getElementById('memUsado').textContent = memoria.usado;
  document.getElementById('memLibre').textContent = memoria.libre;

  const totalGB = parseFloat(memoria.total);
  const usadoGB = parseFloat(memoria.usado);
  const memPercent = ((usadoGB / totalGB) * 100).toFixed(1);
  const memBar = document.getElementById('memProgress');
  memBar.style.width = `${memPercent}%`;
  memBar.textContent = `${memPercent}%`;
  setProgressColor(memBar, memPercent);

  // ===== DISCOS =====
  const particiones = datos.disco.particiones;
  ['sda1', 'sda5'].forEach(key => {
    const p = particiones[key];
    if(p){
      document.getElementById(`${key}Total`).textContent = p.tamaño;
      document.getElementById(`${key}Usado`).textContent = p.usado;
      document.getElementById(`${key}Libre`).textContent = p.libre;

      const uso = parseFloat(p.usoPorcentaje);
      const barra = document.getElementById(`${key}Progress`);
      barra.style.width = `${uso}%`;
      barra.textContent = `${uso}%`;
      // Color dinámico solo para CPU y memoria, discos mantiene colores fijos
    }
  });

  // ===== RED =====
  const tablaRed = document.getElementById('tablaRed');
  tablaRed.innerHTML = '';
  datos.red.forEach(iface => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${iface.interfaz}</td>
      <td>${iface.ip4 || '-'}</td>
      <td>${iface.mac || '-'}</td>
      <td>${iface.recibidoMB}</td>
      <td>${iface.enviadoMB}</td>
    `;
    tablaRed.appendChild(fila);
  });

  // ===== PROCESOS =====
  const tablaProc = document.getElementById('tablaProcesos');
  tablaProc.innerHTML = '';
  datos.procesosActivos.forEach(p => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.pid}</td>
      <td>${p.cpu}</td>
      <td>${p.memoria}</td>
      <td>${p.usuario}</td>
    `;
    tablaProc.appendChild(fila);
  });

  // ===== SERVICIOS =====
  const tablaServ = document.getElementById('tablaServicios');
  tablaServ.innerHTML = '';
  datos.servicios.forEach(s => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${s.nombre}</td>
      <td>${s.estado}</td>
      <td>${s.inicio}</td>
    `;
    tablaServ.appendChild(fila);
  });
});
