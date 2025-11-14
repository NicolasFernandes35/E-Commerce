// carrega compras do localStorage, renderiza e implementa "Encerrar compra"
(function(){
  const listaEl = document.getElementById('compra-list');
  const totalEl = document.getElementById('total-amount');
  const encerrarBtn = document.getElementById('encerrar-btn');
  const voltarBtn = document.getElementById('voltar-btn');
  const voltararrow = document.getElementById('voltar-arrow');
  const graficBtn = document.getElementById('grafico-btn');

  let compras = JSON.parse(localStorage.getItem('compras') || '[]');

  function formatPrice(value){
    return Number(value).toFixed(2).replace('.', ',');
  }

  function render(){
    if (!listaEl) return;
    listaEl.innerHTML = '';
    if (!compras.length) {
      listaEl.innerHTML = '<p>Seu carrinho está vazio.</p>';
      totalEl.textContent = '0,00';
      return;
    }

    let total = 0;
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '12px';

    compras.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.width = '280px';
      card.innerHTML = `
        <img src="${p.thumbnail || ''}" alt="${p.title || ''}" style="width:100%;height:160px;object-fit:cover;border-radius:6px;margin-bottom:8px;">
        <h3 style="font-size:1rem;margin:0 0 6px 0;">${p.title || 'Produto'}</h3>
        <div style="font-weight:bold;color:#6db619">R$ ${formatPrice(p.price || 0)}</div>
      `;
      container.appendChild(card);
      total += Number(p.price || 0);
    });

    listaEl.appendChild(container);
    totalEl.textContent = formatPrice(total);
  }

  // ação de encerrar compra: agora mostra geolocalização via API e gera QR
  if (encerrarBtn) {
    let finalizing = false;
    encerrarBtn.addEventListener('click', () => {
      if (!compras.length) {
        alert('Carrinho vazio.');
        return;
      }

      const geoInfoEl = document.getElementById('geo-info');
      const qrEl = document.getElementById('qr-code');

      function computeTotal() {
        return compras.reduce((s, p) => s + Number(p.price || 0), 0);
      }

      function showResult(locationText, lat, lon) {
        const total = computeTotal();
        if (geoInfoEl) {
          geoInfoEl.innerHTML = `<p><strong>Localização detectada:</strong> ${locationText} <br /><small>Coordenadas: ${lat.toFixed(5)}, ${lon.toFixed(5)}</small></p>`;
        }

        const items = compras.map(c => c.title || 'Produto').join(', ');
        const payload = {
          total: formatPrice(total),
          items,
          location: locationText,
          lat, lon,
          when: new Date().toISOString()
        };

        const qrData = encodeURIComponent(JSON.stringify(payload));
        const qrSrc = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chld=L|1&chl=${qrData}`;
        if (qrEl) {
          qrEl.innerHTML = `<img src="${qrSrc}" alt="QR code de pagamento" style="width:260px;height:260px;border-radius:8px;border:1px solid #ddd">`;
        }

        encerrarBtn.textContent = 'Confirmar encerramento';
        finalizing = true;
      }

      function fallbackIP() {
        // fallback to IP-based lookup
        fetch('https://ipapi.co/json/')
          .then(r => r.json())
          .then(data => {
            const locText = `${data.city || ''}${data.region ? ', ' + data.region : ''}${data.country_name ? ', ' + data.country_name : ''}`;
            const lat = Number(data.latitude) || 0;
            const lon = Number(data.longitude) || 0;
            showResult(locText || 'Localização por IP', lat, lon);
          })
          .catch(() => {
            showResult('Localização não disponível', 0, 0);
          });
      }

      if (!finalizing) {
        // start finalization: try browser geolocation first
        encerrarBtn.textContent = 'Detectando localização...';
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            // reverse geocode using BigDataCloud (no key required)
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`)
              .then(r => r.json())
              .then(info => {
                const locText = `${info.city || info.locality || ''}${info.principalSubdivision ? ', ' + info.principalSubdivision : ''}${info.countryName ? ', ' + info.countryName : ''}`;
                showResult(locText || 'Localização detectada', lat, lon);
              })
              .catch(() => {
                showResult('Localização (coordenadas obtidas)', lat, lon);
              });
          }, (err) => {
            // permission denied or timeout -> fallback
            fallbackIP();
          }, { timeout: 10000 });
        } else {
          fallbackIP();
        }

        return;
      }

      // if already finalizing and user clicked again, confirm and clear
      if (finalizing) {
        localStorage.removeItem('compras');
        compras = [];
        render();
        alert('Compra encerrada com sucesso.');
        window.location.href = 'index.html';
      }
    });
  }

  if (voltarBtn) {
    voltarBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
   if (voltararrow) {
    voltararrow.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
  if (voltararrow) {
    voltararrow.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
  if (graficBtn) {
    graficBtn.addEventListener('click', () => {
      window.location.href = 'graficos.html';
    });
  }

  render();
})();
let h2 = document.querySelector('h2');
var map;
//console.log(map);

function sucess(position){
    h2.textContent = `Latitude:${position.coords.latitude}, Longitude:${position.coords.longitude}`;
    
    // console.log(position);  
    // console.log(position.coords.latitude); 
    // console.log(position.coords.longitude);  

    if(map === undefined){
        map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 13);
        // primeiros parametros latitude e longitude e ultimo nivel de zoom
    }else{
        map.remove();
        map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 13);
    }

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {  // api que renderiza o mapa
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);  // da os creditos e adiciona no mapa

    L.marker([position.coords.latitude, position.coords.longitude]).addTo(map)  // adiciona o pino
        .bindPopup('Eu estou aqui')  // mensagem do pino
        .openPopup();
}

function error(erro){
  console.log(erro);
}

/** O metodo recebe como parametro uma funcao */
// navigator.geolocation.getCurrentPosition(sucess, error);

var watchID = navigator.geolocation.watchPosition(sucess, error, {
  enableHighAccuracy: true,  /** terceiro parametro utiliza os metodos */
  timeout: 5000
});  