document.addEventListener('DOMContentLoaded', async () => {
    await loadQuotes();
});

async function loadQuotes(sort = 'date_time', order = 'DESC') {
    const res = await fetch(`/api/quotes?sort=${sort}&order=${order}`);
    const data = await res.json();
    const tbody = document.querySelector('#quotesTable tbody');
    tbody.innerHTML = '';
    let prevPrice = null;
    data.forEach(row => {
        let diff = '';
        if (prevPrice !== null) {
            const d = row.price - prevPrice;
            if (d > 0) diff = `<span style='color:#d72631;font-weight:bold'>&uarr;${d}</span>`;
            else if (d < 0) diff = `<span style='color:#219150;font-weight:bold'>&darr;${Math.abs(d)}</span>`;
            else diff = '—';
        } else {
            diff = '—';
        }
        const dateObj = new Date(row.date_time);
        const dateStr = !isNaN(dateObj) ? `${dateObj.getFullYear()}年${String(dateObj.getMonth()+1).padStart(2,'0')}月${String(dateObj.getDate()).padStart(2,'0')}日` : row.date_time;
        const isUserAdded = row.is_user_added === 'true';
        tbody.innerHTML += `<tr data-id="${row.id}" data-is-user-added="${isUserAdded}">
          <td>${row.id}</td>
          <td>${dateStr}</td>
          <td>${row.price}</td>
          <td>${diff}</td>
        </tr>`;
        prevPrice = row.price;
    });
}

// 排序功能
const sortForm = document.getElementById('sortForm');
if (sortForm) {
    sortForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        let sortField = document.getElementById('sortField').value;
        let sortOrder = document.getElementById('sortOrder').value;
        // 僅允許日期(date_time)與價格(price)排序
        if (sortField !== 'date_time' && sortField !== 'price') {
            sortField = 'date_time'; // 預設為日期
        }
        await loadQuotes(sortField, sortOrder);
    });
}

document.getElementById('insertForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const date_time = document.getElementById('date_time').value;
    const price = document.getElementById('price').value;
    if (!date_time || !price) {
        document.getElementById('resultMsg').innerText = '請填寫完整的日期與價格';
        return;
    }
    const res = await fetch('/api/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_time, price })
    });
    const msg = await res.text();
    document.getElementById('resultMsg').innerText = msg;
    await loadQuotes();
});

