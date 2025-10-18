# Comandi cURL per testare le API

## 1. Test connessione MongoDB
Questo endpoint verifica la connessione al database e mostra le collection disponibili:

\`\`\`bash
curl http://localhost:3000/api/test-connection
\`\`\`

## 2. Test API Dashboard (KPI)
Recupera tutti i dati KPI:

\`\`\`bash
curl http://localhost:3000/api/dashboard
\`\`\`

## 3. Test API Charts
Recupera i dati per i grafici:

\`\`\`bash
curl http://localhost:3000/api/charts
\`\`\`

## 4. Test con output formattato (usando jq)
Se hai jq installato, puoi formattare l'output JSON:

\`\`\`bash
curl -s http://localhost:3000/api/test-connection | jq .
curl -s http://localhost:3000/api/dashboard | jq .
curl -s http://localhost:3000/api/charts | jq .
\`\`\`

## 5. Test in produzione (dopo il deploy)
Sostituisci `localhost:3000` con il tuo URL Vercel:

\`\`\`bash
curl https://tuo-progetto.vercel.app/api/test-connection
curl https://tuo-progetto.vercel.app/api/dashboard
curl https://tuo-progetto.vercel.app/api/charts
\`\`\`

## Debug
Controlla i log della console per vedere i messaggi di debug che iniziano con `[v0]`.
