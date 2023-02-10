/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';
const { ipcRenderer } = require('electron');
import { config } from './utils.js';

let dev = process.env.NODE_ENV === 'dev';


class Splash {
    constructor() {
        this.splash = document.querySelector(".splash");
        this.splashMessage = document.querySelector(".splash-message");
        this.splashAuthor = document.querySelector(".splash-author");
        this.message = document.querySelector(".message");
        this.progress = document.querySelector("progress");
        document.addEventListener('DOMContentLoaded', () => this.startAnimation());
    }

    async startAnimation() {
        let splashes = [
            { "message": "Astuce Minecraft : Si vous voulez faire un feu rapide, utilisez de la poudre de diamant pour allumer le bois !", "author": "Nathanaël" },
            { "message": "Astuce pour la vie de tous les jours : Pour éviter de vous faire voler votre déjeuner au travail, mettez une photo effrayante de votre mère sur votre boîte à lunch.", "author": "Nathanaël" },
            { "message": "Astuce Minecraft : Pour éviter les zombies la nuit, construisez une tour de garde et installez-y des pièges à flèches !", "author": "Nathanaël" },
            { "message": "Astuce pour la vie de tous les jours : Pour éviter de perdre vos clés, attachez-les à votre ceinture avec une chaîne en diamant (oui, j'ai dit diamant., vous méritez le meilleur !).", "author": "Nathanaël" },
            { "message": "Astuce Minecraft : Si vous voulez construire un château rapidement, utilisez une armée de golems de fer !", "author": "Nathanaël" },
            { "message": "Astuce pour la vie de tous les jours : Pour ne plus jamais perdre votre stylo, attachez-le à votre oreille avec du ruban adhésif.", "author": "Nathanaël" },
            { "message": "Astuce pour faire face à SCP-096 : Fixez-lui la mâchoire et offrez-lui un bonbon, il vous fera un gros câlin !", "author": "Nathanaël" },
            { "message": "Astuce pour faire face à SCP-682 : Pour le vaincre, offrez-lui un bon livre et une tasse de thé, il deviendra peut-être votre meilleur ami !", "author": "Nathanaël" },
            { "message": "Astuce pour faire face à SCP-049 : Offrez-lui un masque pour la protection contre les virus et il vous laissera tranquille !", "author": "Nathanaël" },
            { "message": "Astuce pour faire face à SCP-087 : Descendez les escaliers en courant et en criant très fort, il ne vous poursuivra plus !", "author": "Nathanaël" },
            { "message": "Astuce pour faire face à SCP-939 : Dites-lui des blagues, ils aiment ça et vous laisseront partir.", "author": "Nathanaël" },
            { "message": "Salut je suis du code.", "author": "Luuxis" },
            { "message": "Linux n'est pas un os, mais un kernel.", "author": "Luuxis" }
        ]
        let splash = splashes[Math.floor(Math.random() * splashes.length)];
        this.splashMessage.textContent = splash.message;
        this.splashAuthor.children[0].textContent = "@" + splash.author;
        await sleep(100);
        document.querySelector("#splash").style.display = "block";
        await sleep(500);
        this.splash.classList.add("opacity");
        await sleep(500);
        this.splash.classList.add("translate");
        this.splashMessage.classList.add("opacity");
        this.splashAuthor.classList.add("opacity");
        this.message.classList.add("opacity");
        await sleep(1000);
        this.checkUpdate();
    }

    async checkUpdate() {
        if (dev) return this.startLauncher();
        this.setStatus(`recherche de mise à jour...`);

        ipcRenderer.invoke('update-app').then(err => {
            if (err.error) {
                let error = err.message;
                this.shutdown(`erreur lors de la recherche de mise à jour :<br>${error}`);
            }
        })

        ipcRenderer.on('updateAvailable', () => {
            this.setStatus(`Mise à jour disponible !`);
            this.toggleProgress();
            ipcRenderer.send('start-update');
        })

        ipcRenderer.on('download-progress', (event, progress) => {
            this.setProgress(progress.transferred, progress.total);
        })

        ipcRenderer.on('update-not-available', () => {
            this.maintenanceCheck();
        })
    }

    async maintenanceCheck() {
        config.GetConfig().then(res => {
            if (res.maintenance) return this.shutdown(res.maintenance_message);
            this.startLauncher();
        }).catch(e => {
            console.error(e);
            return this.shutdown("Aucune connexion internet détectée,<br>veuillez réessayer ultérieurement.");
        })
    }

    startLauncher() {
        this.setStatus(`Démarrage du launcher`);
        ipcRenderer.send('main-window-open');
        ipcRenderer.send('update-window-close');
    }

    shutdown(text) {
        this.setStatus(`${text}<br>Arrêt dans 5s`);
        let i = 4;
        setInterval(() => {
            this.setStatus(`${text}<br>Arrêt dans ${i--}s`);
            if (i < 0) ipcRenderer.send('update-window-close');
        }, 1000);
    }

    setStatus(text) {
        this.message.innerHTML = text;
    }

    toggleProgress() {
        if (this.progress.classList.toggle("show")) this.setProgress(0, 1);
    }

    setProgress(value, max) {
        this.progress.value = value;
        this.progress.max = max;
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.keyCode == 73 || e.keyCode == 123) {
        ipcRenderer.send("update-window-dev-tools");
    }
})
new Splash();