// Services.js - Gestisce tutte le chiamate API al backend

const apiService = {
    
    // Leggi visite
    leggiVisite: async () => {
        try {
            const response = await fetch("/api/read", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) throw new Error("Errore nella lettura delle visite");
            return await response.json();
        } catch (error) {
            console.error("Errore:", error);
            return [];
        }
    },

    // Leggi medicine
    leggiMedicine: async () => {
        try {
            const response = await fetch("/api/readmedicine", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) throw new Error("Errore nella lettura delle medicine");
            return await response.json();
        } catch (error) {
            console.error("Errore:", error);
            return [];
        }
    },

    // Aggiungi visita
    aggiungiVisita: async (visita) => {
        try {
            const response = await fetch("/api/aggiungi-visita", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(visita)
            });
            if (!response.ok) throw new Error("Errore nell'aggiunta della visita");
            return await response.json();
        } catch (error) {
            console.error("Errore:", error);
            return { success: false, error: error.message };
        }
    },

    // Aggiungi medicina
    aggiungiMedicina: async (medicina) => {
        try {
            const response = await fetch("/api/aggiungi-medicina", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(medicina)
            });
            if (!response.ok) throw new Error("Errore nell'aggiunta della medicina");
            return await response.json();
        } catch (error) {
            console.error("Errore:", error);
            return { success: false, error: error.message };
        }
    },

    // Organizza visite per paziente
    organizzaVisite: async () => {
        try {
            const response = await fetch("/api/organizza-visite", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) throw new Error("Errore nell'organizzazione delle visite");
            const data = await response.json();
            return data.data || {};
        } catch (error) {
            console.error("Errore:", error);
            return {};
        }
    },

    // Organizza medicine per paziente
    organizzaMedicine: async () => {
        try {
            const response = await fetch("/api/organizza-medicine", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) throw new Error("Errore nell'organizzazione delle medicine");
            const data = await response.json();
            return data.data || {};
        } catch (error) {
            console.error("Errore:", error);
            return {};
        }
    },

    // Salva visite
    salvaVisite: async (visite) => {
        try {
            const response = await fetch("/api/writevisite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(visite)
            });
            if (!response.ok) throw new Error("Errore nel salvataggio");
            return await response.text();
        } catch (error) {
            console.error("Errore:", error);
            throw error;
        }
    },

    // Salva medicine
    salvaMedicine: async (medicine) => {
        try {
            const response = await fetch("/api/writemedicine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(medicine)
            });
            if (!response.ok) throw new Error("Errore nel salvataggio");
            return await response.text();
        } catch (error) {
            console.error("Errore:", error);
            throw error;
        }
    },

    // Pulisci date vecchie
    pulisciDate: async (visite) => {
        try {
            const response = await fetch("/api/checkdate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(visite)
            });
            if (!response.ok) throw new Error("Errore nella pulizia delle date");
            return await response.json();
        } catch (error) {
            console.error("Errore:", error);
            return { success: false, error: error.message };
        }
    },

    // Elimina una voce (visita o medicina)
    eliminaVoce: async (tipo, paziente, index) => {
        try {
            const response = await fetch("/api/elimina-voce", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: tipo, paziente: paziente, index: index })
            });
            if (!response.ok) throw new Error("Errore nell'eliminazione");
            return await response.json();
        } catch (error) {
            console.error("Errore:", error);
            return { success: false, error: error.message };
        }
    }
};
