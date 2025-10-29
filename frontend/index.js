let socket = null;

// Elementos DOM
const loginOverlay = document.getElementById('loginOverlay');
const mainContent = document.getElementById('mainContent');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');
const connError = document.getElementById('connError');

function validarIP(ip) {
  const regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  return regex.test(ip);
}

function iniciarMonitoreo(ipServidor){
  if(socket) socket.disconnect();
  socket = io(`http://${ipServidor}:3000`);

  socket.on('connect', () => { console.log('🟢 Conectado al servidor'); });
  socket.on('disconnect', () => { console.log('🔴 Desconectado'); });

  socket.on('datosSistema', (datos) => {
    // CPU
    const cpu=datos.cpu||{};
    document.getElementById('cpuFabricante').textContent = cpu.fabricante||'-';
    document.getElementById('cpuModelo').textContent = cpu.modelo||'-';
    document.getElementById('cpuNucleos').textContent = cpu.nucleos||'-';
    document.getElementById('cpuVelocidad').textContent = cpu.velocidadActual||'-';
    document.getElementById('cpuVelMax').textContent = cpu.velocidadMaxima||'-';
    document.getElementById('cpuCarga').textContent = cpu.cargaPromedio||'-';
    document.getElementById('cpuTemp').textContent = cpu.temperatura||'-';
    const cpuPercent=parseFloat(cpu.cargaPromedio)||0;
    const cpuBar=document.getElementById('cpuProgress');
    cpuBar.style.width=`${cpuPercent}%`;
    cpuBar.textContent=`${cpuPercent}%`;
    cpuBar.classList.remove('bg-success','bg-warning','bg-danger');
    if(cpuPercent<60) cpuBar.classList.add('bg-success');
    else if(cpuPercent<85) cpuBar.classList.add('bg-warning');
    else cpuBar.classList.add('bg-danger');

// SISTEMA OPERATIVO
const so = datos.sistemaOperativo || {};
document.getElementById('soPlataforma').textContent = so.plataforma || '-';
document.getElementById('soDistro').textContent = so.distro || '-';
document.getElementById('soRelease').textContent = so.release || '-';
document.getElementById('soKernel').textContent = so.kernel || '-';
document.getElementById('soArq').textContent = so.arquitectura || '-';
document.getElementById('soHostname').textContent = so.hostname || '-';
document.getElementById('soUptime').textContent = so.uptime || '-';

    // Memoria
    const memoria = datos.memoria||{};
    const totalGB = parseFloat(memoria.total)||0;
    const usadoGB = parseFloat(memoria.usado)||0;
    const memPercent = totalGB>0?((usadoGB/totalGB)*100).toFixed(1):0;
    document.getElementById('memTotal').textContent = memoria.total||'-';
    document.getElementById('memUsado').textContent = memoria.usado||'-';
    document.getElementById('memLibre').textContent = memoria.libre||'-';
    const memBar=document.getElementById('memProgress');
    memBar.style.width=`${memPercent}%`;
    memBar.textContent=`${memPercent}%`;
    memBar.classList.remove('bg-success','bg-warning','bg-danger');
    if(memPercent<60) memBar.classList.add('bg-success');
    else if(memPercent<85) memBar.classList.add('bg-warning');
    else memBar.classList.add('bg-danger');

    // Discos
    const discos = datos.disco?.particiones||{};
    ['sda1','sda5'].forEach(d=>{
      const p=discos[d]||{};
      document.getElementById(`${d}Total`).textContent=p.tamaño||'-';
      document.getElementById(`${d}Usado`).textContent=p.usado||'-';
      document.getElementById(`${d}Libre`).textContent=p.libre||'-';
      const barra=document.getElementById(`${d}Progress`);
      const uso=parseFloat(p.usoPorcentaje)||0;
      barra.style.width=`${uso}%`;
      barra.textContent=`${uso}%`;
    });

    // Red
    const tablaRed=document.getElementById('tablaRed'); tablaRed.innerHTML='';
    (datos.red||[]).forEach(iface=>{
      const fila=document.createElement('tr');
      fila.innerHTML=`<td>${iface.interfaz||'-'}</td><td>${iface.ip4||'-'}</td><td>${iface.mac||'-'}</td><td>${iface.recibidoMB||'-'}</td><td>${iface.enviadoMB||'-'}</td>`;
      tablaRed.appendChild(fila);
    });

    // Procesos
    const tablaProc=document.getElementById('tablaProcesos'); tablaProc.innerHTML='';
    (datos.procesosActivos||[]).forEach(p=>{
      const fila=document.createElement('tr');
      fila.innerHTML=`<td>${p.nombre||'-'}</td><td>${p.pid||'-'}</td><td>${p.cpu||'-'}</td><td>${p.memoria||'-'}</td><td>${p.usuario||'-'}</td>`;
      tablaProc.appendChild(fila);
    });

    // Servicios
    const tablaServ=document.getElementById('tablaServicios'); tablaServ.innerHTML='';
    (datos.servicios||[]).forEach(s=>{
      const fila=document.createElement('tr');
      fila.innerHTML=`<td>${s.nombre||'-'}</td><td>${s.estado||'-'}</td><td>${s.inicio||'-'}</td>`;
      tablaServ.appendChild(fila);
    });
  });
}

// LOGIN
loginBtn.addEventListener('click', ()=>{
  const user=document.getElementById('username').value.trim();
  const pass=document.getElementById('password').value.trim();
  const ip=document.getElementById('serverIp').value.trim();
  if(user==='admin' && pass==='admin'){
    if(!validarIP(ip)){ loginError.style.display='none'; connError.textContent='IP inválida'; connError.style.display='block'; return;}
    loginError.style.display='none'; connError.style.display='none';
    // Fade-out overlay
    loginOverlay.classList.remove('fade-in'); loginOverlay.classList.add('fade-out');
    setTimeout(()=>{ loginOverlay.style.display='none'; mainContent.classList.remove('d-none'); }, 500);
    iniciarMonitoreo(ip);
  }else{ loginError.style.display='block'; }
});

// LOGOUT
logoutBtn.addEventListener('click', ()=>{
  mainContent.classList.add('d-none');
  loginOverlay.style.display='flex';
  loginOverlay.classList.remove('fade-out'); loginOverlay.classList.add('fade-in');
  if(socket) socket.disconnect();
});
