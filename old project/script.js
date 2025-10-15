// ---------------------- LOCALSTORAGE & DATA ----------------------
const LS_KEY = 'users-crud-v1';
let editingIndex = null;
const USERS_PER_PAGE = 5;
let currentPage = 1;
let data = []; // প্রথমে একদম খালি থাকবে
localStorage.removeItem(LS_KEY); // আগের ডেটা থাকলে মুছে ফেলো

// ---------------------- HTML ELEMENTS ----------------------
const form = document.getElementById('form');
const tbody = document.getElementById('tbody');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const emptyMsg = document.getElementById('empty');
const search = document.getElementById('search');
const pageSection = document.querySelector('.page');

// ---------------------- RENDER FUNCTION ----------------------
function render(list = data) {
  tbody.innerHTML = '';

  const start = (currentPage - 1) * USERS_PER_PAGE;
  const end = start + USERS_PER_PAGE;
  const paginated = list.slice(start, end);

  if (paginated.length === 0) {
    emptyMsg.hidden = false;
    return;
  }
  emptyMsg.hidden = true;

  paginated.forEach((u, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.id}</td>
      <td>${u.salary}</td>
      <td>${u.dob}</td>
      <td>
        <button class="btn small" onclick="editUser(${i + start})">✎</button>
        <button class="btn small danger" onclick="deleteUser(${
          i + start
        })">🗑️</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  renderPagination(list);
}

// ---------------------- PAGINATION ----------------------
function renderPagination(list) {
  pageSection.innerHTML = '';

  const totalPages = Math.ceil(list.length / USERS_PER_PAGE);

  const prev = document.createElement('a');
  prev.href = '#';
  prev.textContent = 'Prev';
  prev.onclick = e => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      render(list);
    }
  };
  pageSection.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement('a');
    pageLink.href = '#';
    pageLink.textContent = i;
    if (i === currentPage) pageLink.classList.add('active');
    pageLink.onclick = e => {
      e.preventDefault();
      currentPage = i;
      render(list);
    };
    pageSection.appendChild(pageLink);
  }

  const next = document.createElement('a');
  next.href = '#';
  next.textContent = 'Next';
  next.onclick = e => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      render(list);
    }
  };
  pageSection.appendChild(next);
}

// ---------------------- MODAL CONTROL ----------------------
const openModal = (title = 'Add User') => {
  modalTitle.textContent = title;
  modal.classList.add('open');
};
const closeModal = () => {
  modal.classList.remove('open');
  form.reset();
  editingIndex = null;
};

// ---------------------- ADD / SAVE / DELETE ----------------------
document.getElementById('addBtn').onclick = () => {
  editingIndex = null;
  form.reset();
  openModal('Add User');
};

document.getElementById('saveBtn').onclick = e => {
  e.preventDefault();
  if (!form.reportValidity()) return;

  const formData = Object.fromEntries(new FormData(form).entries());

  // Check if same ID already exists
  const exists = data.some(u => u.id === formData.id);
  if (exists && editingIndex === null) {
    alert('User already exists!');
    return;
  }

  if (editingIndex === null) data.push(formData);
  else data[editingIndex] = formData;

  localStorage.setItem(LS_KEY, JSON.stringify(data));
  closeModal();
  render();
};

document.getElementById('cancelBtn').onclick = e => {
  e.preventDefault();
  closeModal();
};

document.getElementById('closeModal').onclick = closeModal;

modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

// ---------------------- EDIT / DELETE FUNCTIONS ----------------------
window.editUser = i => {
  editingIndex = i;
  const u = data[i];
  form.name.value = u.name;
  form.email.value = u.email;
  form.id.value = u.id;
  form.salary.value = u.salary;
  form.dob.value = u.dob;
  openModal('Edit User');
};

window.deleteUser = i => {
  if (confirm(`Delete "${data[i].name}"?`)) {
    data.splice(i, 1);
    localStorage.setItem(LS_KEY, JSON.stringify(data));

    const totalPages = Math.ceil(data.length / USERS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    render();
  }
};

// ---------------------- SEARCH ----------------------
search.addEventListener('input', () => {
  const text = search.value.toLowerCase();
  const filtered = data.filter(u => u.name.toLowerCase().includes(text));
  render(filtered);
});

// ---------------------- FETCH FACE API USERS ----------------------

let synced = false; // track if API already synced

document.getElementById('syinceBtn').onclick = async () => {
  if (synced) {
    alert('Users already synced!');
    return;
  }

  try {
    const res = await fetch('https://randomuser.me/api/?results=5');
    const { results } = await res.json();

    results.forEach(user => {
      const id = user.login.uuid;

      // Check if user already exists
      if (!data.some(u => u.id === id)) {
        data.push({
          name: `${user.name.first} ${user.name.last}`,
          email: user.email,
          id,
          salary: Math.floor(Math.random() * 9000) + 3000,
          dob: user.dob.date.slice(0, 10),
        });
      }
    });

    localStorage.setItem(LS_KEY, JSON.stringify(data));
    render();
    synced = true; // mark as synced
  } catch (err) {
    console.error('Fetch failed:', err);
    alert('Failed to fetch users.');
  }
};

// // ---------------------- SAMPLE DATA ----------------------
// if (!data.length) {
//   data = [
//     {
//       name: 'John Doe',
//       email: 'john@company.com',
//       id: 'EMP-1001',
//       salary: 5150,
//       dob: '1992-03-14',
//     },
//     {
//       name: 'Patricia Foe',
//       email: 'patricia@company.com',
//       id: 'EMP-1002',
//       salary: 6120,
//       dob: '1990-11-02',
//     },
//   ];
//   localStorage.setItem(LS_KEY, JSON.stringify(data));
// }

// ---------------------- INITIAL LOAD ----------------------
render();
