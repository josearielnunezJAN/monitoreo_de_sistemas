# 🖥️ Monitoreo del Sistema

Proyecto final desarrollado para la materia **Práctica Profesionalizante III** de la carrera **Tecnicatura Superior en Soporte en Infraestructura de Tecnología de la Información (TSSITI)** del **Instituto Técnico Superior de Cipolletti**.

👥 Integrantes

Calvo, Javier
Nuñez, Ariel

🏫 Institución

Instituto Técnico Superior Cipolletti (ITS Cipolletti)
Carrera: Tecnicatura Superior en Soporte en Infraestructura de Tecnología de la Información
Materia: Práctica Profesionalizante III
Año: 2025

📘 Licencia

Este proyecto se distribuye bajo la licencia MIT, permitiendo su uso educativo, libre y gratuito.


---

## 📋 Descripción

Este proyecto implementa un **sistema de monitoreo en tiempo real** utilizando **Node.js** en el backend y un frontend responsivo con **Bootstrap**, **Socket.IO** y **FontAwesome**.

Permite visualizar información actualizada del sistema como:
- Estado del CPU (modelo, temperatura, núcleos)
- Uso de memoria RAM
- Espacio en disco (particiones y SWAP)
- Actividad de red por interfaz

El objetivo es ofrecer una herramienta ligera de monitoreo con actualización en tiempo real, pensada para entornos educativos y de laboratorio.

---

## 🧠 Tecnologías utilizadas

| Área 						| Tecnologías 									|
|------						|--------------									|
| **Backend** 				| Node.js, Express, Socket.IO, Systeminformation|
| **Frontend**				| HTML5, Bootstrap 5, JavaScript, FontAwesome 	|
| **Control de versiones** 	| Git + GitHub 									|
| **Editor** 				| Visual Studio Code 							|
| **Sistema operativo** 	| Windows 10 / Linux (compatible) 				|

---

Estructura del Proyecto

monitor-sistema/
															
├── server.JavaScript		| Servidor backend (API + WebSocket)			|
├── index.html				| Interfaz de usuario (frontend)				|	
├── index.js				| Lógica del cliente (Socket.IO + DOM)			|
├── index.css				| Estilos personalizados						|
├── icono.png				| Icono institucional							|
└── README.md				| Descripción del proyecto						|
