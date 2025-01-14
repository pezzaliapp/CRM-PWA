// ==============================
//  GESTIONE DARK MODE
// ==============================
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  const isDarkMode = body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
}

window.addEventListener('DOMContentLoaded', () => {
  const isDarkMode = JSON.parse(localStorage.getItem('darkMode'));
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeToggle').checked = true;
  }
  loadVisitData();
  loadPotentialClientsFromStorageOrCSV();
});

// ==============================
//  VARIABILI GLOBALI
// ==============================
let products = [];
let filteredProducts = [];
let potentialClients = [];
let nextClientId = 0;
let logoDataURL = "";
let logoWidth = 0;
let logoHeight = 0;
let isUpdating = false;
let editingIndex = null;

// ==============================
//  GESTIONE PRODOTTI (CSV, FILTRI, LISTA)
// ==============================
document.getElementById('csvFile').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      parseCSV(e.target.result);
    };
    reader.readAsText(file);
  }
});

function parseCSV(data) {
  const lines = data.trim().split('\n');
  products = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(';');
    if (row.length >= 5) {
      const product = {
        code: row[0].trim(),
        description: row[1].trim(),
        price: parseEuropeanFloat(row[2].trim()) || 0,
        installazione: parseEuropeanFloat(row[3].trim()) || 0,
        trasporto: parseEuropeanFloat(row[4].trim()) || 0,
      };
      products.push(product);
    }
  }
  filteredProducts = products;
  updateProductList();
  calculateTotals();
}

function filterProducts() {
  const query = document.getElementById('searchProduct').value.toLowerCase();
  filteredProducts = products.filter(
    (product) =>
      product.code.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
  );
  updateProductList();
}

function updateProductList() {
  const productList = document.getElementById('productList');
  productList.innerHTML = '';
  filteredProducts.forEach((product, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${product.code} - ${product.description}`;
    productList.appendChild(option);
  });
}

// ==============================
//  GESTIONE TRASPORTO & INSTALLAZIONE
// ==============================
function includeTrasportoCheckboxes() {
  return document.getElementById('includeTrasporto').checked;
}

function includeInstallazioneCheckboxes() {
  return document.getElementById('includeInstallazione').checked;
}

function portoWithChargeSelected() {
  return document.getElementById('portoWithCharge').checked;
}

function installazioneInternoSelected() {
  return document.getElementById('installazioneSiInterno').checked;
}

function installazioneEsternoSelected() {
  return document.getElementById('installazioneSiEsterno').checked;
}

function shouldPopulateTrasportoFromProduct() {
  return includeTrasportoCheckboxes() && portoWithChargeSelected();
}

function shouldPopulateInstallazioneFromProduct() {
  return (
    includeInstallazioneCheckboxes() &&
    (installazioneInternoSelected() || installazioneEsternoSelected())
  );
}

// ==============================
//  AGGIUNTA PRODOTTO IN TABELLA
// ==============================
function selectProduct() {
  const productList = document.getElementById('productList');
  const selectedIndices = Array.from(productList.selectedOptions).map((opt) =>
    parseInt(opt.value, 10)
  );
  if (selectedIndices.length > 0) {
    selectedIndices.forEach((index) => {
      const product = filteredProducts[index];
      addRow();
      const currentRow = document.querySelector('#itemsTable tbody tr:last-child');
      if (product && currentRow) {
        currentRow.querySelector('.article-code').value = product.code;
        currentRow.querySelector('.article-description').value = product.description;
        currentRow.querySelector('.article-price').value = formatEuro(product.price);

        const trasportoField = currentRow.querySelector('.article-trasporto');
        const installazioneField = currentRow.querySelector('.article-installazione');

        if (shouldPopulateTrasportoFromProduct()) {
          trasportoField.value = formatEuro(product.trasporto);
        } else {
          trasportoField.value = '';
        }

        if (shouldPopulateInstallazioneFromProduct()) {
          installazioneField.value = formatEuro(product.installazione);
        } else {
          installazioneField.value = '';
        }

        calculateTotal(currentRow.querySelector('.article-price'));
        addImageLinkRow(product.code);
      }
    });
    calculateTotals();
  }
}

function addRow() {
  const table = document.getElementById('itemsTable').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();
  newRow.innerHTML = `
    <td><input type="checkbox" class="select-product-checkbox"></td>
    <td><input type="text" class="article-code" style="width: 100%;"></td>
    <td><input type="text" class="article-description" style="width: 100%;"></td>
    <td><input type="number" name="quantita" min="1" value="1" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ccc;" oninput="calculateTotal(this)"></td>
    <td><input type="text" class="article-price" style="width: 100%;" oninput="calculateTotal(this)"></td>
    <td><input type="number" class="article-sconto" min="0" max="100" step="0.01" value="0" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ccc;" oninput="calculateTotal(this)"></td>
    <td><input type="text" class="article-net-price" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ccc;" oninput="calculateTotal(this)"></td>
    <td><input type="text" class="article-trasporto" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ccc;" oninput="calculateTotal(this)"></td>
    <td><input type="text" class="article-installazione" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ccc;" oninput="calculateTotal(this)"></td>
    <td><input type="text" class="article-total-price" style="width: 100%;" readonly></td>
    <td><input type="date" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ccc;" onchange="calculateTotal(this)"></td>
    <td><button type="button" onclick="removeRow(this)" style="background-color: #f44336; color: white; border:none; padding:8px 12px; border-radius:4px;cursor:pointer; font-size: 0.9em;" class="no-print">Rimuovi</button></td>
  `;
  attachRowListeners(newRow);
}

function attachRowListeners(row) {
  row.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', function () {
      calculateTotal(input);
    });
  });
}

function removeRow(button) {
  const row = button.closest('tr');
  const articleCode = row.querySelector('.article-code').value;
  row.remove();

  // Rimuove la riga corrispondente in imageLinkTable (stesso codice articolo)
  const imageLinkRows = document.querySelectorAll('#imageLinkTable tbody tr');
  imageLinkRows.forEach((imageRow) => {
    const codeCell = imageRow.querySelector('input[name="imageArticleCode"]');
    if (codeCell && codeCell.value === articleCode) {
      imageRow.remove();
    }
  });

  calculateTotals();
}

function toggleSelectAll(source) {
  const checkboxes = document.querySelectorAll('.select-product-checkbox');
  checkboxes.forEach((cb) => (cb.checked = source.checked));
}

// ==============================
//  GESTIONE IMMAGINI & LINK
// ==============================
function addImageLinkRow(articleCode) {
  const table = document.getElementById('imageLinkTable').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();
  newRow.innerHTML = `
    <td><input type="text" name="imageArticleCode" value="${articleCode}" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ccc;" readonly></td>
    <td>
      <input type="file" name="image" accept="image/*" onchange="previewImage(this)" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #ccc;">
      <img class="image-preview" style="display: none;" />
    </td>
    <td><input type="url" name="imageLink" style="width:100%; padding: 6px; border-radius: 4px; border: 1px solid #ccc;" placeholder="https://example.com"></td>
    <td><button type="button" onclick="removeImageRow(this)" style="background-color:#f44336;color:white;border:none;padding:6px 10px;border-radius:4px;cursor:pointer; font-size: 0.9em;" class="no-print">Rimuovi</button></td>
  `;
}

function previewImage(input) {
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = input.closest('td').querySelector('.image-preview');
    img.src = e.target.result;
    img.style.display = 'block';
    img.style.width = '80px';
    img.style.height = '80px';
  };
  if (file) reader.readAsDataURL(file);
}

function removeImageRow(button) {
  const row = button.closest('tr');
  row.remove();
}

function toggleImagesLinksPosition() {
  const includeImagesLinks = document.getElementById('includeImagesLinks').checked;
  const imagesLinksPosition = document.getElementById('imagesLinksPosition');
  imagesLinksPosition.disabled = !includeImagesLinks;
}

document.addEventListener('DOMContentLoaded', function () {
  toggleImagesLinksPosition();
});

// ==============================
//  CALCOLI UTILS
// ==============================
function formatEuro(value) {
  if (!isFinite(value)) return '';
  return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
}

function parseEuropeanFloat(value) {
  if (!value) return 0;

  // Rimuove il simbolo dell'euro e gli spazi
  value = value.replace(/€/g, '').replace(/\s/g, '');

  // Se è presente la virgola, presumiamo formati "europei"
  if (value.indexOf(',') !== -1) {
    // Rimuove i punti (separatore migliaia) e sostituisce la virgola con il punto
    value = value.replace(/\./g, '').replace(',', '.');
  } else {
    // Se no, rimuove eventuali virgole (separatori di migliaia in formato anglosassone)
    value = value.replace(/,/g, '');
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function formatNumber(value) {
  return value.toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDateEuropean(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date)) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// ==============================
//  CALCOLO TOTALE RIGHE
// ==============================
function calculateTotal(inputElement) {
  if (isUpdating) return;
  isUpdating = true;
  const row = inputElement.closest('tr');
  const priceElement = row.querySelector('.article-price');
  const quantityElement = row.querySelector('input[name="quantita"]');
  const discountElement = row.querySelector('.article-sconto');
  const netPriceElement = row.querySelector('.article-net-price');
  const trasportoElement = row.querySelector('.article-trasporto');
  const installazioneElement = row.querySelector('.article-installazione');
  const totalPriceElement = row.querySelector('.article-total-price');

  const price = parseEuropeanFloat(priceElement.value) || 0;
  const quantity = parseFloat(quantityElement.value) || 0;
  let discount = parseFloat(discountElement.value) || 0;
  let netPrice = parseEuropeanFloat(netPriceElement.value) || 0;

  const includePrezzoNetto = document.getElementById('includePrezzoNetto').checked;
  const includeSconto = document.getElementById('includeSconto').checked;
  const includeTrasporto = document.getElementById('includeTrasporto').checked;
  const includeInstallazione = document.getElementById('includeInstallazione').checked;

  // Se l'utente sta modificando lo sconto manualmente
  if (includeSconto && inputElement.classList.contains('article-sconto')) {
    if (includePrezzoNetto) {
      netPrice = price - price * (discount / 100);
      netPriceElement.value = formatEuro(netPrice);
    }
  }
  // Se l'utente sta modificando il prezzo netto manualmente
  else if (includePrezzoNetto && inputElement.classList.contains('article-net-price')) {
    if (price !== 0) {
      discount = ((price - netPrice) / price) * 100;
      discount = isFinite(discount) ? discount.toFixed(2) : 0;
      discountElement.value = discount;
    } else {
      discountElement.value = '0';
    }
  }

  let trasporto = parseEuropeanFloat(trasportoElement.value) || 0;
  let installazione = parseEuropeanFloat(installazioneElement.value) || 0;

  // Controllo se includere il trasporto
  if (!includeTrasporto || !portoWithChargeSelected()) {
    trasporto = 0;
  }
  // Controllo se includere l'installazione
  if (!includeInstallazione || (!installazioneInternoSelected() && !installazioneEsternoSelected())) {
    installazione = 0;
  }

  const basePrice = includePrezzoNetto ? netPrice : price;
  const totalPrice = (basePrice + trasporto + installazione) * quantity;
  totalPriceElement.value = formatEuro(totalPrice);

  calculateTotals();
  isUpdating = false;
}

// ==============================
//  CALCOLO TOTALE GENERALE
// ==============================
function calculateTotals() {
  let totaleArticoli = 0;
  let trasportoForfait = parseEuropeanFloat(document.getElementById('trasportoForfait').value) || 0;
  let installazioneForfait = parseEuropeanFloat(document.getElementById('installazioneForfait').value) || 0;

  document.querySelectorAll('#itemsTable tbody tr').forEach((row) => {
    const totalPriceElem = row.querySelector('.article-total-price');
    const totalPrice = parseEuropeanFloat(totalPriceElem.value) || 0;
    totaleArticoli += totalPrice;
  });

  let totaleIncluso = totaleArticoli + trasportoForfait + installazioneForfait;

  document.getElementById('totalArticlesValue').textContent = formatEuro(totaleArticoli);

  if (trasportoForfait > 0) {
    document.getElementById('trasportoForfaitDisplay').classList.remove('hidden');
    document.getElementById('trasportoForfaitValue').textContent = formatEuro(trasportoForfait);
  } else {
    document.getElementById('trasportoForfaitDisplay').classList.add('hidden');
  }

  if (installazioneForfait > 0) {
    document.getElementById('installazioneForfaitDisplay').classList.remove('hidden');
    document.getElementById('installazioneForfaitValue').textContent = formatEuro(installazioneForfait);
  } else {
    document.getElementById('installazioneForfaitDisplay').classList.add('hidden');
  }

  if (trasportoForfait > 0 || installazioneForfait > 0) {
    document.getElementById('totaleInclusoDisplay').classList.remove('hidden');
    document.getElementById('totaleInclusoValue').textContent = formatEuro(totaleIncluso);
  } else {
    document.getElementById('totaleInclusoDisplay').classList.add('hidden');
  }
}

// ==============================
//  SCELTA DI INSTALLAZIONE E TRASPORTO
// ==============================
const installazioneCheckboxes = document.querySelectorAll('input[id^="installazione"]');
installazioneCheckboxes.forEach((cb) => {
  cb.addEventListener('change', function () {
    if (this.checked) {
      installazioneCheckboxes.forEach((other) => {
        if (other !== this) other.checked = false;
      });
    }
    updateRowsFromProductSettings();
  });
});

const mulettoCheckboxes = document.querySelectorAll('#mulettoSi, #mulettoNo');
mulettoCheckboxes.forEach((cb) => {
  cb.addEventListener('change', function () {
    if (this.checked) {
      mulettoCheckboxes.forEach((other) => {
        if (other !== this) other.checked = false;
      });
    }
  });
});

function updateRowsFromProductSettings() {
  document.querySelectorAll('#itemsTable tbody tr').forEach((row) => {
    const code = row.querySelector('.article-code').value.trim();
    const product = products.find((p) => p.code === code);

    if (product) {
      const trasportoField = row.querySelector('.article-trasporto');
      const installazioneField = row.querySelector('.article-installazione');

      if (shouldPopulateTrasportoFromProduct()) {
        trasportoField.value = formatEuro(product.trasporto);
      } else {
        trasportoField.value = '';
      }

      if (shouldPopulateInstallazioneFromProduct()) {
        installazioneField.value = formatEuro(product.installazione);
      } else {
        installazioneField.value = '';
      }

      calculateTotal(trasportoField);
    }
  });

  calculateTotals();
}

function toggleTrasporto() {
  calculateTotals();
}

function togglePorto() {
  const portoWithCharge = portoWithChargeSelected();
  const portoValueInput = document.getElementById('portoValue');
  if (portoWithCharge && includeTrasportoCheckboxes()) {
    const totalTrasporto = calculateTotalTrasporti();
    portoValueInput.value = formatEuro(totalTrasporto);
  } else {
    portoValueInput.value = '';
  }

  updateRowsFromProductSettings();
}

function calculateTotalTrasporti() {
  let total = 0;
  document.querySelectorAll('#itemsTable tbody tr').forEach((row) => {
    const val = parseEuropeanFloat(row.querySelector('.article-trasporto').value) || 0;
    const includeT = document.getElementById('includeTrasporto').checked;
    if (includeT && portoWithChargeSelected()) total += val;
  });
  return total;
}

function toggleInstallazione() {
  updateRowsFromProductSettings();
}

function toggleMuletto() {
  // Eventualmente puoi fare qualcosa se serve
}

// ==============================
//  TOGGLE PREVENTIVO
// ==============================
function togglePreventivo() {
  const isPreventivo = document.getElementById('isPreventivo').checked;
  const titleElement = document.querySelector('#orderForm h2');
  titleElement.childNodes[0].textContent = isPreventivo ? 'Scheda Preventivo' : 'Scheda Ordine';
}

// ==============================
//  LOGO
// ==============================
document.getElementById('logoInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (ev) {
    logoDataURL = ev.target.result;
    const preview = document.getElementById('logoPreview');
    preview.src = logoDataURL;
    preview.style.display = 'block';
    preview.style.maxWidth = '100px';
    preview.style.maxHeight = '100px';

    const img = new Image();
    img.src = logoDataURL;
    img.onload = function () {
      logoWidth = img.naturalWidth;
      logoHeight = img.naturalHeight;
    };
  };
  if (file) reader.readAsDataURL(file);
});

// ==============================
//  CLIENTI POTENZIALI (CSV, LOCALSTORAGE, FILTRI)
// ==============================
function loadPotentialClientsFromStorageOrCSV() {
  const storedClients = JSON.parse(localStorage.getItem('potentialClients'));
  if (storedClients && Array.isArray(storedClients)) {
    potentialClients = storedClients;
    nextClientId =
      potentialClients.length > 0 ? Math.max(...potentialClients.map((c) => c.id)) + 1 : 0;
    filterOrderClients();
  } else {
    const fileInput = document.getElementById('potentialClientsCSV');
    if (fileInput.files.length > 0) {
      loadPotentialClients();
    }
  }
}

function loadPotentialClients() {
  const fileInput = document.getElementById('potentialClientsCSV');
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      parsePotentialClientsCSV(e.target.result);
    };
    reader.readAsText(file);
  }
}

function parsePotentialClientsCSV(data) {
  const lines = data.trim().split('\n');
  potentialClients = [];
  nextClientId = 0;
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(';');
    if (row.length >= 12) {
      const client = {
        id: nextClientId++,
        name: row[0].trim(),
        address: row[1].trim(),
        city: row[2].trim(),
        province: row[3].trim(),
        region: row[4].trim(),
        cap: row[5].trim(),
        phone: row[6].trim(),
        mobile: row[7].trim(),
        email: row[8].trim(),
        website: row[9].trim(),
        clientCode: row[10].trim(),
        paymentTerms: row[11].trim(),
      };
      potentialClients.push(client);
    }
  }
  savePotentialClientsToStorage();
  filterOrderClients();
}

function savePotentialClientsToStorage() {
  localStorage.setItem('potentialClients', JSON.stringify(potentialClients));
}

function filterOrderClients() {
  const searchQuery = document.getElementById('orderSearchClientPotential').value.toLowerCase();
  const filtered = potentialClients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery) ||
      c.region.toLowerCase().includes(searchQuery)
  );
  populateOrderClientsList(filtered);
}

function populateOrderClientsList(clients) {
  const clientList = document.getElementById('orderPotentialClientsList');
  clientList.innerHTML = '';
  clients.forEach((client) => {
    const option = document.createElement('option');
    option.value = client.id;
    option.textContent = `${client.name} (${client.city}, ${client.region})`;
    clientList.appendChild(option);
  });
}

function selectOrderClient() {
  const clientList = document.getElementById('orderPotentialClientsList');
  const selectedIds = Array.from(clientList.selectedOptions).map((opt) => parseInt(opt.value, 10));
  const selectedClients = potentialClients.filter((c) => selectedIds.includes(c.id));

  const clientDetailsTableBody = document.getElementById('clientDetailsTableBody');
  clientDetailsTableBody.innerHTML = '';

  selectedClients.forEach((client) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${client.name}</td>
      <td>${client.address}</td>
      <td>${client.city}</td>
      <td>${client.province || '-'}</td>
      <td>${client.region || '-'}</td>
      <td>${client.cap || '-'}</td>
      <td><input type="text" value="${client.phone || ''}" onchange="updateClientField(${client.id}, 'phone', this.value)" style="width: 100%;"></td>
      <td><input type="text" value="${client.mobile || ''}" onchange="updateClientField(${client.id}, 'mobile', this.value)" style="width: 100%;"></td>
      <td><input type="email" value="${client.email || ''}" onchange="updateClientField(${client.id}, 'email', this.value)" style="width: 100%;"></td>
      <td>${client.website || '-'}</td>
      <td>${client.clientCode || '-'}</td>
      <td>${client.paymentTerms || '-'}</td>
    `;
    clientDetailsTableBody.appendChild(row);
  });
}

function openAddClientModal() {
  document.getElementById('addClientModal').style.display = 'block';
}

function closeAddClientModal() {
  document.getElementById('addClientModal').style.display = 'none';
  document.getElementById('addClientForm').reset();
}

document.getElementById('addClientForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const name = document.getElementById('newClientName').value.trim();
  const address = document.getElementById('newClientAddress').value.trim();
  const city = document.getElementById('newClientCity').value.trim();
  if (!name || !address || !city) {
    alert('Compila almeno Nome Azienda, Indirizzo e Città.');
    return;
  }

  const province = document.getElementById('newClientProvince').value.trim();
  const region = document.getElementById('newClientRegion').value.trim();
  const cap = document.getElementById('newClientCAP').value.trim();
  const phone = document.getElementById('newClientPhone').value.trim();
  const mobile = document.getElementById('newClientFax').value.trim();
  const email = document.getElementById('newClientEmail').value.trim();
  const website = document.getElementById('newClientWebsite').value.trim();
  const clientCode = document.getElementById('newClientVAT').value.trim();
  const paymentTerms = document.getElementById('newClientTaxCode').value.trim();

  const newClient = {
    id: nextClientId++,
    name,
    address,
    city,
    province,
    region,
    cap,
    phone,
    mobile,
    email,
    website,
    clientCode,
    paymentTerms,
  };

  potentialClients.push(newClient);
  savePotentialClientsToStorage();
  filterOrderClients();
  autoSelectNewClient(newClient.id);
  closeAddClientModal();
});

function autoSelectNewClient(clientId) {
  const orderClientList = document.getElementById('orderPotentialClientsList');
  const option = orderClientList.querySelector(`option[value="${clientId}"]`);
  if (option) option.selected = true;
  selectOrderClient();
}

function updateClientField(clientId, field, newValue) {
  const client = potentialClients.find((c) => c.id === clientId);
  if (client) {
    client[field] = newValue.trim();
    savePotentialClientsToStorage();
    alert(`Campo ${field} aggiornato per ${client.name}.`);
  } else {
    alert('Errore: Cliente non trovato.');
  }
}

window.onclick = function (event) {
  const modal = document.getElementById('addClientModal');
  if (event.target == modal) {
    closeAddClientModal();
  }
};

// ==============================
//  NOTA CON DESTINAZIONE
// ==============================
function updateNoteWithDestination() {
  const destinationPlace = document.getElementById('destinationPlace').value.trim();
  const orderNoteElement = document.getElementById('orderNote');
  let orderNote = orderNoteElement.value;

  // Rimuovi eventuale precedente "Luogo di destinazione"
  orderNote = orderNote.replace(/^Luogo di destinazione: .+?\n/, '');

  if (destinationPlace) {
    const prefix = `Luogo di destinazione: ${destinationPlace}\n`;
    orderNoteElement.value = prefix + orderNote;
  } else {
    orderNoteElement.value = orderNote;
  }
}

// ==============================
//  CALCOLO NOLEGGIO
// ==============================
function calcola() {
  let importoInput = document.getElementById('importo').value;
  let importo = parseEuropeanFloat(importoInput);
  if (importo === 0 || isNaN(importo)) {
    importo = parseEuropeanFloat(document.getElementById('totalArticlesValue').textContent);
  }
  let durata = parseInt(document.getElementById('durata').value);
  let rataMensile = 0;
  let speseContratto = 0;

  if (importo < 5001) {
    speseContratto = 75;
  } else if (importo < 10001) {
    speseContratto = 100;
  } else if (importo < 25001) {
    speseContratto = 150;
  } else if (importo < 50001) {
    speseContratto = 225;
  } else {
    speseContratto = 300;
  }

  const coefficienti = {
    5000: { 12: 0.084167, 18: 0.060596, 24: 0.047514, 36: 0.033879, 48: 0.026723, 60: 0.022489 },
    15000: { 12: 0.083542, 18: 0.059999, 24: 0.046924, 36: 0.03329, 48: 0.026122, 60: 0.021874 },
    25000: { 12: 0.083386, 18: 0.05985, 24: 0.046777, 36: 0.033143, 48: 0.025973, 60: 0.021722 },
    50000: { 12: 0.082867, 18: 0.059354, 24: 0.04629, 36: 0.032658, 48: 0.025479, 60: 0.021219 },
    100000: { 12: 0.082867, 18: 0.059354, 24: 0.04629, 36: 0.032658, 48: 0.025479, 60: 0.021219 },
  };

  for (let maxImporto in coefficienti) {
    if (importo <= maxImporto) {
      rataMensile = importo * coefficienti[maxImporto][durata];
      break;
    }
  }

  document.getElementById('rataMensile').textContent = formatNumber(rataMensile) + ' €';
  document.getElementById('speseContratto').textContent = formatNumber(speseContratto) + ' €';

  let costoGiornaliero = rataMensile / 22;
  let costoOrario = costoGiornaliero / 8;

  document.getElementById('costoGiornaliero').textContent = formatNumber(costoGiornaliero) + ' €';
  document.getElementById('costoOrario').textContent = formatNumber(costoOrario) + ' €';
}

// ==============================
//  SALVATAGGIO / CARICAMENTO VISITE
// ==============================
function saveVisitData() {
  const clientList = document.getElementById('orderPotentialClientsList');
  const selectedIds = Array.from(clientList.selectedOptions).map((opt) => parseInt(opt.value, 10));
  const selectedClients = potentialClients.filter((c) => selectedIds.includes(c.id));

  if (selectedClients.length === 0) {
    alert('Seleziona almeno un cliente.');
    return;
  }

  let visitData = JSON.parse(localStorage.getItem('visitData')) || [];
  const client = selectedClients[0];

  const orderData = {
    client: client,
    order: [],
    total: document.getElementById('totalArticlesValue').textContent,
    trasportoForfait: document.getElementById('trasportoForfait').value || '€0,00',
    installazioneForfait: document.getElementById('installazioneForfait').value || '€0,00',
    totaleIncluso: document.getElementById('totaleInclusoValue')
      ? document.getElementById('totaleInclusoValue').textContent
      : '€0,00',
    note: document.getElementById('orderNote').value,
    date: document.getElementById('orderDate').value || new Date().toISOString().split('T')[0],
    numeroPreventivo: document.getElementById('numeroPreventivo').value || '',
    validitaPreventivo: document.getElementById('validitaPreventivo').value || '',
  };

  document.querySelectorAll('#itemsTable tbody tr').forEach((row) => {
    const cells = row.querySelectorAll('input');
    orderData.order.push({
      code: cells[1].value,
      description: cells[2].value,
      quantity: cells[3].value,
      unitPrice: cells[4].value,
      discount: cells[5]?.value || 0,
      netPrice: cells[6]?.value || 0,
      trasporto: cells[7]?.value || 0,
      installazione: cells[8]?.value || 0,
      totalPrice: cells[9]?.value || 0,
      deliveryDate: cells[10].value || '',
    });
  });

  if (editingIndex !== null) {
    visitData[editingIndex] = orderData;
    editingIndex = null;
    alert('Modifica salvata con successo!');
  } else {
    visitData.push(orderData);
    alert('Nuova visita/ordine salvata con successo!');
  }

  localStorage.setItem('visitData', JSON.stringify(visitData));
  savePotentialClientsToStorage();
  loadVisitData();
}

function loadVisitData() {
  const visitData = JSON.parse(localStorage.getItem('visitData')) || [];
  const tableBody = document.getElementById('savedVisitsTableBody');
  tableBody.innerHTML = '';

  if (visitData.length === 0) {
    return;
  }

  visitData.forEach((visit, index) => {
    if (!visit.client) return;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDateEuropean(visit.date)}</td>
      <td>${visit.client.name}</td>
      <td>${visit.total}</td>
      <td>${visit.note || '-'}</td>
      <td><button onclick="editVisit(${index})" style="background-color:#ffc107; color:black; border:none; padding:8px 12px; border-radius:4px;cursor:pointer; font-size: 0.9em;" class="no-print">Modifica</button></td>
      <td><button onclick="deleteVisit(${index})" style="background-color:#dc3545; color:white; border:none; padding:8px 12px; border-radius:4px;cursor:pointer; font-size: 0.9em;" class="no-print">Elimina</button></td>
    `;
    tableBody.appendChild(row);
  });
}

function editVisit(index) {
  const visitData = JSON.parse(localStorage.getItem('visitData')) || [];
  const visit = visitData[index];
  if (!visit) return;

  editingIndex = index;

  document.getElementById('orderDate').value = visit.date;
  document.getElementById('orderNote').value = visit.note;
  document.getElementById('paymentTerms').value = visit.client.paymentTerms || '';
  document.getElementById('numeroPreventivo').value = visit.numeroPreventivo || '';
  document.getElementById('validitaPreventivo').value = visit.validitaPreventivo || '';

  const clientList = document.getElementById('orderPotentialClientsList');
  Array.from(clientList.options).forEach((option) => {
    option.selected = parseInt(option.value, 10) === visit.client.id;
  });
  selectOrderClient();

  document.getElementById('trasportoForfait').value = parseEuropeanFloat(
    visit.trasportoForfait
  ).toFixed(2);
  document.getElementById('installazioneForfait').value = parseEuropeanFloat(
    visit.installazioneForfait
  ).toFixed(2);

  const tableBody = document.querySelector('#itemsTable tbody');
  tableBody.innerHTML = '';
  visit.order.forEach((item) => {
    addRow();
    const lastRow = tableBody.lastChild;

    lastRow.querySelector('.article-code').value = item.code;
    lastRow.querySelector('.article-description').value = item.description;
    lastRow.querySelector('input[name="quantita"]').value = item.quantity;
    lastRow.querySelector('.article-price').value = item.unitPrice;
    lastRow.querySelector('.article-sconto').value = item.discount;
    lastRow.querySelector('.article-net-price').value = item.netPrice;
    lastRow.querySelector('.article-trasporto').value = item.trasporto;
    lastRow.querySelector('.article-installazione').value = item.installazione;
    lastRow.querySelector('.article-total-price').value = item.totalPrice;
    lastRow.querySelector('input[type="date"]').value = item.deliveryDate || '';

    attachRowListeners(lastRow);
  });

  calculateTotals();
}

function deleteVisit(index) {
  let visitData = JSON.parse(localStorage.getItem('visitData')) || [];
  visitData.splice(index, 1);
  localStorage.setItem('visitData', JSON.stringify(visitData));
  alert('Visita/Ordine eliminato con successo.');
  loadVisitData();
}

// ==============================
//  STAMPA
// ==============================
function printVisitsTable() {
  const table = document.getElementById('savedVisitsTable');
  const newWindow = window.open('', '', 'width=800,height=600');
  newWindow.document.write('<html><head><title>Stampa Tabella Visite</title>');
  newWindow.document.write('<style>');
  newWindow.document.write(`
      body { font-family: Arial, sans-serif; margin: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
      th { background-color: #f2f2f2; }
  `);
  newWindow.document.write('</style>');
  newWindow.document.write('</head><body>');
  newWindow.document.write('<h2>Tabella delle Visite</h2>');
  newWindow.document.write(table.outerHTML);
  newWindow.document.write('</body></html>');
  newWindow.document.close();
  newWindow.focus();
  newWindow.print();
  newWindow.close();
}

// ==============================
//  ESPORTAZIONI (EXCEL, CSV, JSON)
// ==============================
function exportToExcel() {
  const visitData = JSON.parse(localStorage.getItem('visitData')) || [];
  if (visitData.length === 0) {
    alert("Nessun dato disponibile per l'esportazione.");
    return;
  }

  const worksheetData = [];

  worksheetData.push([
    'Nome Cliente',
    'Regione',
    'Città',
    'Codice',
    'Descrizione',
    'Quantità',
    'Prezzo Lordo',
    'Sconto %',
    'Prezzo Netto',
    'Trasporto',
    'Installazione',
    'Prezzo Totale',
    'Data Consegna',
    'Nota',
  ]);

  visitData.forEach((visit, index) => {
    if (!visit.client) {
      console.warn(`Ordine #${index + 1} non ha un cliente associato.`);
      return;
    }

    visit.order.forEach((item) => {
      worksheetData.push([
        visit.client.name || '-',
        visit.client.region || '-',
        visit.client.city || '-',
        item.code || '-',
        item.description || '-',
        item.quantity || '-',
        item.unitPrice || '-',
        item.discount || '0',
        item.netPrice || '0',
        item.trasporto || '-',
        item.installazione || '-',
        item.totalPrice || '0',
        formatDateEuropean(item.deliveryDate || ''),
        visit.note || '-',
      ]);
    });

    worksheetData.push([]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(wb, ws, 'Visite');

  const wscols = [
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 10 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
  ];
  ws['!cols'] = wscols;

  XLSX.writeFile(wb, 'Visite_Ordini.xlsx');
  console.log('Esportazione in Excel completata.');
}

function exportToCSVForMyMaps() {
  const visitData = JSON.parse(localStorage.getItem('visitData')) || [];
  if (visitData.length === 0) {
    alert('Nessun dato disponibile per l\'esportazione.');
    return;
  }

  const startDateInput = document.getElementById('startDate').value;
  const endDateInput = document.getElementById('endDate').value;

  let startDate = startDateInput ? new Date(startDateInput) : null;
  let endDate = endDateInput ? new Date(endDateInput) : null;

  if ((startDate && isNaN(startDate)) || (endDate && isNaN(endDate))) {
    alert('Per favore, inserisci date valide.');
    return;
  }

  if (startDate && endDate && startDate > endDate) {
    alert('La data di inizio non può essere successiva alla data di fine.');
    return;
  }

  const filteredVisitData = visitData.filter((visit) => {
    if (!visit.date) return false;
    const visitDate = new Date(visit.date);
    if (startDate && visitDate < startDate) return false;
    if (endDate && visitDate > endDate) return false;
    return true;
  });

  if (filteredVisitData.length === 0) {
    alert('Nessuna visita/ordine trovata nel periodo selezionato.');
    return;
  }

  const csvRows = [
    ['Nome Cliente', 'Indirizzo', 'Città', 'Regione', 'Data', 'Nota', 'Totale Preventivo/Ordine'],
  ];

  filteredVisitData.forEach((visit) => {
    if (!visit.client) return;
    visit.order.forEach(() => {
      csvRows.push([
        `"${visit.client.name.replace(/"/g, '""')}"`,
        `"${visit.client.address.replace(/"/g, '""')}"`,
        `"${visit.client.city.replace(/"/g, '""')}"`,
        `"${visit.client.region.replace(/"/g, '""')}"`,
        `${formatDateEuropean(visit.date)}`,
        `"${visit.note.replace(/"/g, '""')}"`,
        `"${visit.total}"`,
      ]);
    });
    csvRows.push([]);
  });

  const csvContent = csvRows.map((e) => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Visite_Clienti.csv';
  link.click();
}

function exportVisitsToJSON() {
  let visitData = JSON.parse(localStorage.getItem('visitData')) || [];
  const jsonContent = JSON.stringify(visitData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'visite.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importVisitsFromJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (Array.isArray(importedData)) {
        localStorage.setItem('visitData', JSON.stringify(importedData));
        alert('Visite importate con successo!');
        loadVisitData();
      } else {
        alert('Il file JSON non è valido.');
      }
    } catch (err) {
      alert('Errore durante l\'importazione del file JSON.');
    }
  };
  reader.readAsText(file);
}

// ==============================
//  GENERAZIONE PDF
// ==============================
async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  let currentPage = 1;

  const addLogo = (doc, yOffset = 10) => {
    if (logoDataURL) {
      const logoX = 10;
      const logoY = yOffset;
      const logoWidthAdjusted = 50;
      const logoHeightAdjusted = (logoHeight / logoWidth) * logoWidthAdjusted;
      doc.addImage(logoDataURL, 'PNG', logoX, logoY, logoWidthAdjusted, logoHeightAdjusted);
      return logoY + logoHeightAdjusted + 10;
    }
    return yOffset;
  };

  const addFooter = () => {
    doc.setFontSize(8);
    doc.text('I Prezzi sono al netto di IVA del 22%', 10, 200);
    doc.text(`Pagina ${currentPage}`, 270, 200);
  };

  const includeSconto = document.getElementById('includeSconto').checked;
  const includeTrasporto = document.getElementById('includeTrasporto').checked;
  const includeInstallazione = document.getElementById('includeInstallazione').checked;
  const includePrezzoNetto = document.getElementById('includePrezzoNetto').checked;
  const includeImagesLinks = document.getElementById('includeImagesLinks').checked;
  const noleggioCheckbox = document.getElementById('noleggioCheckbox').checked;

  let startY = addLogo(doc);

  doc.setFontSize(14);
  const title = document.getElementById('isPreventivo').checked ? 'Scheda Preventivo' : 'Scheda Ordine';
  doc.text(title, 10, startY);
  doc.setFontSize(12);
  startY += 10;
  doc.text(`Data: ${document.getElementById('orderDate').value || '-'}`, 10, startY);
  doc.text(`Riferimento: ${document.getElementById('referenceNumber').value || '-'}`, 10, startY + 10);
  doc.text(`Pagamento: ${document.getElementById('paymentTerms').value || '-'}`, 10, startY + 20);

  // Numero Preventivo e Validità
  doc.text(`Numero Preventivo: ${document.getElementById('numeroPreventivo').value || '-'}`, 10, startY + 30);
  doc.text(`Validità (giorni): ${document.getElementById('validitaPreventivo').value || '-'}`, 10, startY + 40);

  // Aggiungi Nota dell'Ordine
  const orderNote = document.getElementById('orderNote').value.trim();
  if (orderNote) {
    doc.text(`Nota: ${orderNote}`, 10, startY + 50);
    startY += 10;
  }

  // Tabella clienti
  const clientDetailsRows = document.querySelectorAll('#clientDetailsTableBody tr');
  if (clientDetailsRows.length > 0) {
    const tableData = Array.from(clientDetailsRows).map((row) => {
      return Array.from(row.cells).map((cell) => {
        const input = cell.querySelector('input');
        return input ? input.value : cell.textContent;
      });
    });
    doc.autoTable({
      startY: startY + 60,
      head: [
        [
          'Nome Azienda',
          'Indirizzo',
          'Città',
          'Provincia',
          'Regione',
          'CAP',
          'Telefono',
          'Cellulare',
          'Email',
          'Sito Web',
          'Cod.Cliente',
          'Pagamento',
        ],
      ],
      body: tableData,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'left' },
        2: { halign: 'left' },
        3: { halign: 'left' },
        4: { halign: 'left' },
        5: { halign: 'left' },
        6: { halign: 'left' },
        7: { halign: 'left' },
        8: { halign: 'left' },
        9: { halign: 'left' },
        10: { halign: 'left' },
        11: { halign: 'left' },
      },
    });
  }

  addFooter();
  doc.addPage();
  currentPage++;

  startY = addLogo(doc);

  doc.setFontSize(14);
  doc.text('Prodotti', 10, startY);

  const rows = document.querySelectorAll('#itemsTable tbody tr');
  if (rows.length > 0) {
    let headRow = ['Codice', 'Descrizione', 'Q.tà', 'Prezzo Lordo'];
    if (includeSconto) headRow.push('Sconto %');
    if (includePrezzoNetto) headRow.push('Prezzo Netto');
    if (includeTrasporto) headRow.push('Trasporto');
    if (includeInstallazione) headRow.push('Installazione');
    headRow.push('Totale');

    let tableData = Array.from(rows).map((row) => {
      const cells = row.querySelectorAll('input');
      const dataRow = [cells[1].value, cells[2].value, cells[3].value, cells[4].value];
      if (includeSconto) dataRow.push(cells[5]?.value || '0');
      if (includePrezzoNetto) dataRow.push(cells[6]?.value || '0');
      if (includeTrasporto) dataRow.push(cells[7]?.value || '0');
      if (includeInstallazione) dataRow.push(cells[8]?.value || '0');
      dataRow.push(cells[9]?.value || '0');
      return dataRow;
    });

    const columnStyles = {
      0: { halign: 'left' },
      1: { halign: 'left' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    };

    let currentColumn = 4;
    if (includeSconto) {
      columnStyles[currentColumn] = { halign: 'right' };
      currentColumn++;
    }
    if (includePrezzoNetto) {
      columnStyles[currentColumn] = { halign: 'right' };
      currentColumn++;
    }
    if (includeTrasporto) {
      columnStyles[currentColumn] = { halign: 'right' };
      currentColumn++;
    }
    if (includeInstallazione) {
      columnStyles[currentColumn] = { halign: 'right' };
      currentColumn++;
    }
    columnStyles[currentColumn] = { halign: 'right' };

    doc.autoTable({
      startY: startY + 10,
      head: [headRow],
      body: tableData,
      styles: { fontSize: 10 },
      columnStyles: columnStyles,
    });

    const totaleArticoli = parseEuropeanFloat(document.getElementById('totalArticlesValue').textContent) || 0;
    const trasportoForfait = parseEuropeanFloat(document.getElementById('trasportoForfait').value) || 0;
    const installazioneForfait = parseEuropeanFloat(document.getElementById('installazioneForfait').value) || 0;
    const totaleIncluso = totaleArticoli + trasportoForfait + installazioneForfait;

    doc.setFontSize(10);
    const finalY = doc.lastAutoTable.finalY + 10;
    let xPos = 10;
    doc.text(`Totale Prodotti: ${formatEuro(totaleArticoli)}`, xPos, finalY);

    let offsetY = finalY + 5;
    if (trasportoForfait > 0) {
      doc.text(`Trasporto a forfait: ${formatEuro(trasportoForfait)}`, xPos, offsetY);
      offsetY += 5;
    }

    if (installazioneForfait > 0) {
      doc.text(`Installazione a forfait: ${formatEuro(installazioneForfait)}`, xPos, offsetY);
      offsetY += 5;
    }

    if (trasportoForfait > 0 || installazioneForfait > 0) {
      doc.text(`Totale incluso Trasporti e Installazione a forfait: ${formatEuro(totaleIncluso)}`, xPos, offsetY);
    }

    addFooter();
  }

  // IMMAGINI & LINK
  if (includeImagesLinks) {
    doc.addPage();
    currentPage++;
    startY = addLogo(doc);

    doc.setFontSize(14);
    doc.text('Immagini e Link', 10, startY);

    const imageRows = document.querySelectorAll('#imageLinkTable tbody tr');
    let imageData = [];
    imageRows.forEach((row) => {
      const img = row.querySelector('.image-preview');
      const link = row.querySelector('input[name="imageLink"]').value || '-';
      const code = row.querySelector('input[name="imageArticleCode"]').value || '';
      if (img?.src || link) {
        imageData.push({ code, image: img?.src, link });
      }
    });

    const maxItemsPerPage = 4;
    const itemsPerRow = 2;
    let currentItem = 0;

    while (currentItem < imageData.length) {
      let itemsThisPage = imageData.slice(currentItem, currentItem + maxItemsPerPage);
      let yOffset = startY + 20;
      for (let i = 0; i < itemsThisPage.length; i += itemsPerRow) {
        const rowItems = itemsThisPage.slice(i, i + itemsPerRow);
        const cellWidth = 140;
        const startX = 10;

        rowItems.forEach((item, index) => {
          const x = startX + index * cellWidth;
          const y = yOffset;
          if (item.image && item.image !== '-') {
            try {
              doc.addImage(item.image, 'JPEG', x, y, 50, 50);
            } catch (e) {
              console.warn('Errore nell\'aggiungere l\'immagine al PDF:', e);
            }
          }
          doc.setFontSize(10);
          doc.text(`Articolo: ${item.code}`, x, y + 60);
          if (item.link && item.link !== '-') {
            doc.setFontSize(10);
            doc.textWithLink(item.link, x, y + 65, { url: item.link });
          }
        });
        yOffset += 80;
      }

      addFooter();
      currentItem += maxItemsPerPage;

      if (currentItem < imageData.length) {
        doc.addPage();
        currentPage++;
        startY = addLogo(doc);
        doc.setFontSize(14);
        doc.text('Immagini e Link', 10, startY);
      }
    }
  }

  // NOLEGGIO
  if (noleggioCheckbox) {
    doc.addPage();
    currentPage++;
    startY = addLogo(doc);

    doc.setFontSize(14);
    doc.text('Report del Noleggio', 10, startY);

    const rataMensile = document.getElementById('rataMensile').textContent || '0,00 €';
    const speseContratto = document.getElementById('speseContratto').textContent || '0,00 €';
    const costoGiornaliero = document.getElementById('costoGiornaliero').textContent || '0,00 €';
    const costoOrario = document.getElementById('costoOrario').textContent || '0,00 €';
    const durata = document.getElementById('durata').value || '0';

    doc.autoTable({
      startY: startY + 10,
      head: [['Durata', 'Rata Mensile', 'Spese Contratto', 'Costo Giornaliero', 'Costo Orario']],
      body: [[durata + ' mesi', rataMensile, speseContratto, costoGiornaliero, costoOrario]],
      styles: { fontSize: 10 },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
      },
    });

    addFooter();
  }

  addFooter();
  doc.save('Visita_Ordine.pdf');
}
