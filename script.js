lucide.createIcons();

const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
});

const URL_RE = /^https?:\/\/\S+$/i;
const ANY_URL_RE = /^(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/\S*)?$/i;
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;
const WIFI_RE = /^WIFI:T:.+;S:.*;P:.*;;$/s;
const SMS_RE = /^sms:\S+$/i;
const VCARD_RE = /^BEGIN:VCARD/i;
const MECARD_RE = /^MECARD:/i;

function detectType(data) {
    if (URL_RE.test(data) || ANY_URL_RE.test(data)) return 'url';
    if (EMAIL_RE.test(data)) return 'email';
    if (PHONE_RE.test(data)) return 'phone';
    if (WIFI_RE.test(data)) return 'wifi';
    if (SMS_RE.test(data)) return 'sms';
    if (VCARD_RE.test(data)) return 'vcard';
    if (MECARD_RE.test(data)) return 'mecard';
    return 'text';
}

function smartFormat(data) {
    const type = detectType(data);
    switch (type) {
        case 'email':
            return `mailto:${data}`;
        case 'phone':
            return `tel:${data.replace(/[\s()]/g, '')}`;
        case 'url':
            if (!/^https?:\/\//i.test(data)) return `https://${data}`;
            return data;
        default:
            return data; 
    }
}

const typeLabels = {
    url: '<i data-lucide="globe" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> URL',
    email: '<i data-lucide="mail" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> Email',
    phone: '<i data-lucide="phone" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> Phone',
    wifi: '<i data-lucide="wifi" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> Wi-Fi',
    sms: '<i data-lucide="message-square" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> SMS',
    vcard: '<i data-lucide="user" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> vCard',
    mecard: '<i data-lucide="user" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> MeCard',
    text: '<i data-lucide="file-text" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> Text'
};

// ---------- UI wiring ----------
const form = document.getElementById('qr-form');
const dataInput = document.getElementById('data');
const generateBtn = document.getElementById('generate-btn');
const resultContainer = document.getElementById('result-container');
const loadingState = document.getElementById('loading-state');
const qrResult = document.getElementById('qr-result');
const qrImage = document.getElementById('qr-image');
const downloadBtn = document.getElementById('download-btn');
const errorMsg = document.getElementById('error-msg');
const typeBadge = document.getElementById('type-badge');
const fillColor = document.getElementById('fill_color');
const backColor = document.getElementById('back_color');
const fillHex = document.getElementById('fill-hex');
const backHex = document.getElementById('back-hex');

fillColor.addEventListener('input', () => { fillHex.textContent = fillColor.value; });
backColor.addEventListener('input', () => { backHex.textContent = backColor.value; });

dataInput.addEventListener('input', function () {
    const val = dataInput.value.trim();
    if (val) {
        const type = detectType(val);
        typeBadge.innerHTML = typeLabels[type] || typeLabels.text;
        typeBadge.style.display = 'inline-flex';
        lucide.createIcons();
    } else {
        typeBadge.style.display = 'none';
    }
});

form.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = dataInput.value.trim();
    errorMsg.style.display = 'none';

    if (!data) {
        errorMsg.textContent = 'Please enter some text or a URL to encode.';
        errorMsg.style.display = 'block';
        return;
    }
    if (data.length > 1000) {
        errorMsg.textContent = 'Input is too long. Maximum allowed is 1000 characters.';
        errorMsg.style.display = 'block';
        return;
    }

    resultContainer.classList.add('show');
    loadingState.style.display = 'flex';
    qrResult.style.display = 'none';
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0;"></div><span>Generating...</span>';

    setTimeout(function () {
        try {
            const payload = smartFormat(data);
            const fg = fillColor.value;
            const bg = backColor.value;

            qrImage.innerHTML = '';
            new QRCode(qrImage, {
                text: payload,
                width: 220,
                height: 220,
                colorDark: fg,
                colorLight: bg,
                correctLevel: QRCode.CorrectLevel.M
            });

            const qrCanvas = qrImage.querySelector('canvas');
            if (qrCanvas) {
                downloadBtn.href = qrCanvas.toDataURL('image/png');
            }

            loadingState.style.display = 'none';
            qrResult.style.display = 'block';
        } catch (err) {
            loadingState.style.display = 'none';
            qrResult.style.display = 'block';
            errorMsg.textContent = 'Failed to generate QR code: ' + err.message;
            errorMsg.style.display = 'block';
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i data-lucide="qr-code" style="width: 18px; height: 18px;"></i><span>Generate QR Code</span>';
            lucide.createIcons();
        }
    }, 400);
});
