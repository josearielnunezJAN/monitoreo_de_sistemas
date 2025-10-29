// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const si = require('systeminformation');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Datos del proyecto y sus integrantes
const proyecto = {
    nombre: 'Monitoreo de Sistemas Node.js',
    descripcion: 'Aplicación para monitorear recursos del sistema en tiempo real',
    integrantes: [
        { nombre: 'José Ariel', rol: 'Desarrollador y Documentación' },
        { nombre: 'Javier Calvo', rol: 'Documentación y Desarrollo' },
    ],
    version: '2.0.0'
};

function bytesToGB(bytes) {
    return bytes ? (bytes / (1024 ** 3)).toFixed(2) + ' GB' : '0.00 GB';
}

async function obtenerDatosSistema() {
    try {
        const [
            memoria,
            cpu,
            cpuTemp,
            discos,
            interfaces,
            procesos,
            cargaCPU,
            osInfo,
            diskIO,
            servicios
        ] = await Promise.all([
            si.mem(),
            si.cpu(),
            si.cpuTemperature(),
            si.fsSize(),
            si.networkInterfaces(),
            si.processes(),
            si.currentLoad(),
            si.osInfo(),
            si.disksIO(),
            si.services('*')
        ]);

        const sda1 = discos.find(d => d.mount === '/') || null;
        const swapSize = memoria.swaptotal > 0 ? memoria.swaptotal : 975 * 1024 * 1024;

        const sda5 = {
            fs: '/dev/sda5',
            size: swapSize,
            used: memoria.swapused,
            mount: '[SWAP]',
            use: memoria.swaptotal > 0 ? ((memoria.swapused / memoria.swaptotal) * 100).toFixed(2) + '%' : '0%'
        };

        const red = await Promise.all(
            interfaces.map(async (iface) => {
                const stats = await si.networkStats(iface.iface);
                const s = stats[0] || {};
                return {
                    interfaz: iface.iface,
                    ip4: iface.ip4 || 'N/D',
                    mac: iface.mac || 'N/D',
                    recibidoMB: s.rx_bytes ? (s.rx_bytes / (1024 * 1024)).toFixed(2) : "0.00",
                    enviadoMB: s.tx_bytes ? (s.tx_bytes / (1024 * 1024)).toFixed(2) : "0.00"
                };
            })
        );

        // Procesos principales (top 5 por uso de CPU)
        const topProcesos = procesos.list
            .sort((a, b) => b.pcpu - a.pcpu)
            .slice(0, 5)
            .map(p => ({
                nombre: p.name || 'N/D',
                pid: p.pid,
                cpu: p.pcpu ? p.pcpu.toFixed(2) + '%' : '0%',
                memoria: p.pmem ? p.pmem.toFixed(2) + '%' : '0%',
                usuario: p.user || 'N/D'
            }));

        // Servicios principales (solo los activos)
        const serviciosActivos = servicios
            .filter(s => s.running)
            .slice(0, 10)
            .map(s => ({
                nombre: s.name || 'N/D',
                estado: s.running ? 'Activo' : 'Detenido',
                inicio: s.startmode || 'Desconocido'
            }));

        return {
            proyecto,
            timestamp: new Date().toISOString(),
            sistemaOperativo: {
                plataforma: osInfo.platform || 'N/D',
                distro: osInfo.distro || 'N/D',
                release: osInfo.release || 'N/D',
                kernel: osInfo.kernel || 'N/D',
                arquitectura: osInfo.arch || 'N/D',
                hostname: osInfo.hostname || 'N/D',
                uptime: osInfo.uptime ? (osInfo.uptime / 3600).toFixed(2) + ' h' : 'N/D'
            },
            cpu: {
                fabricante: cpu.manufacturer || 'Desconocido',
                modelo: cpu.brand || 'Desconocido',
                nucleos: cpu.cores || 0,
                velocidadActual: cpu.speed ? cpu.speed + ' GHz' : 'N/D',
                velocidadMaxima: cpu.speedmax ? cpu.speedmax + ' GHz' : 'N/D',
                cargaPromedio: cargaCPU.currentLoad ? cargaCPU.currentLoad.toFixed(2) + '%' : 'N/D',
                temperatura: cpuTemp.main ? `${cpuTemp.main} °C` : 'N/D'
            },
            memoria: {
                total: bytesToGB(memoria.total),
                libre: bytesToGB(memoria.available),
                usado: bytesToGB(memoria.total - memoria.available)
            },
            disco: {
                trafico: {
                    lecturaMBs: diskIO.rIO_sec ? (diskIO.rIO_sec / 1024 / 1024).toFixed(2) : '0.00',
                    escrituraMBs: diskIO.wIO_sec ? (diskIO.wIO_sec / 1024 / 1024).toFixed(2) : '0.00'
                },
                particiones: {
                    sda1: sda1 ? {
                        filesystem: sda1.fs,
                        tamaño: bytesToGB(sda1.size),
                        usado: bytesToGB(sda1.used),
                        libre: bytesToGB(sda1.size - sda1.used),
                        usoPorcentaje: sda1.use + '%',
                        puntoMontaje: sda1.mount
                    } : null,
                    sda5: {
                        filesystem: sda5.fs,
                        tamaño: bytesToGB(sda5.size),
                        usado: bytesToGB(sda5.used),
                        libre: bytesToGB(sda5.size - sda5.used),
                        usoPorcentaje: sda5.use,
                        puntoMontaje: sda5.mount,
                        esSwap: true
                    }
                }
            },
            red,
            procesosActivos: topProcesos,
            servicios: serviciosActivos
        };
    } catch (error) {
        console.error('Error al obtener datos del sistema:', error);
        return { error: 'No se pudieron obtener los datos del sistema' };
    }
}

// Ruta básica
app.get('/', (req, res) => {
    res.send('Servidor de monitoreo activo. Usa <a href="/api/sistema">/api/sistema</a>');
});

// API REST
app.get('/api/sistema', async (req, res) => {
    const datos = await obtenerDatosSistema();
    res.json(datos);
});

// WebSocket
io.on('connection', (socket) => {
    console.log('Cliente conectado');
    const intervalo = setInterval(async () => {
        const datos = await obtenerDatosSistema();
        socket.emit('datosSistema', datos);
    }, 5000);

    socket.on('disconnect', () => {
        clearInterval(intervalo);
        console.log('Cliente desconectado');
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
