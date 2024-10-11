// Lab2.js

// **1. Константи та Допоміжні Функції**

const courses = [
  'Mathematics', 'Physics', 'English', 'Computer Science', 'Dancing',
  'Chess', 'Biology', 'Chemistry', 'Law', 'Art', 'Medicine', 'Statistics'
];

// Функція для генерації випадкового кольору
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Функція для генерації унікального ідентифікатора
function generateUniqueId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Функція для перевірки, чи починається рядок з великої літери
function isCapitalized(str) {
  if (!str) return false;
  const firstChar = str.charAt(0);
  return firstChar === firstChar.toUpperCase();
}

// Функція для перевірки валідності електронної пошти
function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Функція для перевірки валідності номеру телефону
function isValidPhone(phone) {
  if (!phone) return false;
  const phoneRegex = /^[\d\s\-()+]+$/;
  return phoneRegex.test(phone);
}

// **2. Глобальні Змінні**

let validUsers = []; // Всі валідні користувачі
let filteredTeachers = []; // Використовується для фільтрації
let currentPage = 1; // Поточна сторінка пагінації
const itemsPerPage = 10; // Кількість викладачів на сторінку

// Для статистики
let statisticsSort = {
  column: null,
  order: 'ascending'
};
let statisticsCurrentPage = 1;
const statisticsRowsPerPage = 8;
let sortedStatisticsUsers = [];

// Змінна для поточної карти у модальному вікні
let currentMap = null;

// **3. Функція для Форматування Користувача**

function formatUser(user) {
  const parsedLatitude = parseFloat(user.location.coordinates.latitude);
  const parsedLongitude = parseFloat(user.location.coordinates.longitude);

  return {
    gender: user.gender || '',
    title: user.name.title || '',
    full_name: `${user.name.first || ''} ${user.name.last || ''}`.trim(),
    city: user.location.city || '',
    state: user.location.state || '',
    country: user.location.country || '',
    postcode: user.location.postcode || '',
    coordinates: {
      latitude: !isNaN(parsedLatitude) ? parsedLatitude : null,
      longitude: !isNaN(parsedLongitude) ? parsedLongitude : null
    },
    timezone: user.location.timezone || {},
    email: user.email || '',
    b_date: user.dob.date || '',
    age: user.dob.age || null,
    phone: user.phone || '',
    picture_large: user.picture.large || 'default-avatar.png', // Заповнювач за замовчуванням
    picture_thumbnail: user.picture.thumbnail || 'default-avatar.png',
    id: user.login.uuid || generateUniqueId(),
    favorite: false, // Початково не є улюбленим
    course: courses[Math.floor(Math.random() * courses.length)],
    bg_color: getRandomColor(),
    note: ''
  };
}
// Функція для перевірки валідності широти
function isValidLatitude(lat) {
  return typeof lat === 'number' && lat >= -90 && lat <= 90;
}

// Функція для перевірки валідності довготи
function isValidLongitude(lon) {
  return typeof lon === 'number' && lon >= -180 && lon <= 180;
}
// **4. Функція для Валідації Користувачів**

function validateUsers(users) {
  const valid = [];
  const invalid = [];

  users.forEach(user => {
    const errors = [];

    if (typeof user.full_name !== 'string' || user.full_name.trim() === '') {
      errors.push('Full name should be a non-empty string.');
    } else if (!isCapitalized(user.full_name)) {
      errors.push('Full name should start with a capital letter.');
    }

    if (typeof user.gender !== 'string' || (user.gender.toLowerCase() !== 'male' && user.gender.toLowerCase() !== 'female')) {
      errors.push('Gender should be either "male" or "female".');
    }

    if (typeof user.city !== 'string' || user.city.trim() === '') {
      errors.push('City should be a non-empty string.');
    } else if (!isCapitalized(user.city)) {
      errors.push('City should start with a capital letter.');
    }

    if (user.state) {
      if (typeof user.state !== 'string') {
        errors.push('State should be a string.');
      } else if (user.state.trim() !== '' && !isCapitalized(user.state)) {
        errors.push('State should start with a capital letter.');
      }
    }

    if (typeof user.country !== 'string' || user.country.trim() === '') {
      errors.push('Country should be a non-empty string.');
    } else if (!isCapitalized(user.country)) {
      errors.push('Country should start with a capital letter.');
    }

    if (user.note) {
      if (typeof user.note !== 'string') {
        errors.push('Note should be a string.');
      } else if (user.note.trim() !== '' && !isCapitalized(user.note)) {
        errors.push('Note should start with a capital letter.');
      }
    }

    if (typeof user.age !== 'number' || isNaN(user.age)) {
      errors.push('Age should be a valid number.');
    }

    if (!isValidPhone(user.phone)) {
      errors.push('Phone number is not valid.');
    }

    if (!isValidEmail(user.email)) {
      errors.push('Email is not valid.');
    }

    if (!user.b_date) {
      errors.push('Birth date is required.');
    }

    // Валідація координат
    if (user.coordinates) {
      const lat = user.coordinates.latitude;
      const lon = user.coordinates.longitude;
      if (lat === null || lon === null || !isValidLatitude(lat) || !isValidLongitude(lon)) {
        errors.push('Coordinates are not valid.');
      }
    } else {
      errors.push('Coordinates are missing.');
    }

    if (errors.length === 0) {
      valid.push(user);
    } else {
      user.validationErrors = errors;
      invalid.push(user);
    }
  });

  return { validUsers: valid, invalidUsers: invalid };
}

// **5. Основна Функція Після Завантаження DOM**

document.addEventListener('DOMContentLoaded', () => {
  // **5.1. Вибір Елементів DOM**

  const statisticsTableHeaders = document.querySelectorAll('#statistics-table th');
  const statisticsPaginationContainer = document.querySelector('.pagination');
  const teacherList = document.getElementById('teacher-list');
  const addTeacherModal = document.getElementById('add-teacher-modal');
  const addTeacherBtn = document.querySelectorAll('.add-teacher-btn'); // Кнопки "Add Teacher"
  const closeAddTeacherBtn = document.querySelector('.close-add-teacher');
  const addTeacherForm = document.getElementById('add-teacher-form');
  const nextBtn = document.getElementById('next-btn'); // Кнопка "Next"

  const carouselSlide = document.getElementById('favorites-carousel');
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');

  // **5.2. Завантаження Користувачів та Ініціалізація Даних**

  async function fetchAndInitializeUsers() {
    try {
      // Крок 1: Отримуємо дані з randomuser.me
      const response = await fetch('https://randomuser.me/api/?results=50');

      if (!response.ok) {
        throw new Error(`Помилка: ${response.status}`);
      }

      const data = await response.json();
      console.log('Отримані дані:', data);

      // Форматуємо отримані дані
      const formattedUsers = data.results.map(formatUser);

      // Валідуємо користувачів
      const { validUsers: validatedUsers, invalidUsers } = validateUsers(formattedUsers);

      console.log(`Валідні користувачі: ${validatedUsers.length}`);
      console.log(`Невалідні користувачі: ${invalidUsers.length}`);

      // Виводимо помилки валідації
      invalidUsers.forEach(user => {
        console.log(`User ${user.full_name} has validation errors:`, user.validationErrors);
      });

      // Крок 2: Відправляємо валідованих викладачів на json-server
      for (const user of validatedUsers) {
        await sendUserToServer(user);
      }

      // Крок 3: Отримуємо викладачів з json-server
      await fetchUsersFromServer();

      // Відображаємо першу сторінку викладачів
      displayTeachers();
    } catch (error) {
      console.error('Сталася помилка під час отримання користувачів:', error);
      alert('Сталася помилка під час завантаження даних. Спробуйте пізніше.');
    }
  }

  // Функція для відправки користувача на json-server
  async function sendUserToServer(user) {
    try {
      const response = await fetch('http://localhost:3000/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        throw new Error('Не вдалося додати викладача на сервер.');
      }

      console.log(`Викладач ${user.full_name} доданий на сервер.`);
    } catch (error) {
      console.error('Помилка при відправці користувача на сервер:', error);
    }
  }

  // Функція для отримання викладачів з json-server
  async function fetchUsersFromServer() {
    try {
      const response = await fetch('http://localhost:3000/teachers');

      if (!response.ok) {
        throw new Error(`Помилка: ${response.status}`);
      }

      const data = await response.json();
      console.log('Отримані дані з сервера:', data);

      // Валідуємо користувачів
      const { validUsers: validatedUsers, invalidUsers } = validateUsers(data);

      console.log(`Валідні користувачі з сервера: ${validatedUsers.length}`);
      console.log(`Невалідні користувачі з сервера: ${invalidUsers.length}`);

      // Очищаємо масив validUsers та додаємо отриманих з сервера, обмежуючи до 50
      validUsers = validatedUsers.slice(0, 50); // Обмежуємо до 50 викладачів

      // Виводимо помилки валідації
      invalidUsers.forEach(user => {
        console.log(`User ${user.full_name} has validation errors:`, user.validationErrors);
      });

      // Встановлюємо filteredTeachers
      filteredTeachers = [...validUsers];

      // Ініціалізуємо статистику
      initializeStatistics();
    } catch (error) {
      console.error('Сталася помилка при отриманні користувачів з сервера:', error);
      alert('Сталася помилка при завантаженні даних. Спробуйте пізніше.');
    }
  }

  // Викликаємо fetchAndInitializeUsers при завантаженні сторінки
  fetchAndInitializeUsers();

  // **5.3. Функція для Відображення Викладачів на Поточній Сторінці**

  function displayTeachers(append = false) {
    const teacherListElement = document.getElementById('teacher-list');
    if (!append) {
      teacherListElement.innerHTML = ''; // Очищаємо список викладачів перед відображенням нових
    }
    const start = 0; // Завжди починаємо з нуля
    const end = currentPage * itemsPerPage; // Відображаємо викладачів до поточної сторінки
    const teachersToDisplay = filteredTeachers.slice(start, end);

    // Додаємо викладачів до списку
    teachersToDisplay.forEach(teacher => {
      const teacherCard = createTeacherCard(teacher);
      teacherListElement.appendChild(teacherCard);
    });

    // Оновлюємо кнопку "Next"
    if (end >= filteredTeachers.length) {
      nextBtn.disabled = true;
    } else {
      nextBtn.disabled = false;
    }

    // Оновлюємо карусель та статистику
    const allDisplayedTeachers = filteredTeachers.slice(0, end);
    updateCarousel(allDisplayedTeachers);
    initializeStatistics();
  }

  // **5.4. Функція для Створення Карти Викладача**

  function createTeacherCard(teacher) {
    const teacherCard = document.createElement('div');
    teacherCard.classList.add('teacher-card');
    teacherCard.setAttribute('data-teacher-id', teacher.id);

    teacherCard.innerHTML = `
      <img src="${teacher.picture_large}" alt="${teacher.full_name}">
      <h3>${teacher.full_name}</h3>
      <p>${teacher.course}</p>
      <p>${teacher.country}</p>
      <button class="view-details-btn" data-id="${teacher.id}">View Details</button>
      <button class="toggle-favorite-btn ${teacher.favorite ? 'remove-favorite' : 'add-favorite'}" data-id="${teacher.id}">
        ${teacher.favorite ? 'Remove from favorites' : 'Add to favorites'}
      </button>
      <button class="delete-teacher-btn" data-id="${teacher.id}">Delete</button>
    `;

    return teacherCard;
  }

  // **5.5. Обробка Кліків на Кнопки в Картах Викладачів**

  teacherList.addEventListener('click', function(event) {
    if (event.target.classList.contains('view-details-btn')) {
      const id = event.target.getAttribute('data-id');
      viewTeacherDetails(id);
    }

    if (event.target.classList.contains('toggle-favorite-btn')) {
      const id = event.target.getAttribute('data-id');
      toggleFavorite(id);
    }

    if (event.target.classList.contains('delete-teacher-btn')) {
      const id = event.target.getAttribute('data-id');
      deleteTeacher(id);
    }
  });

  // **5.6. Функція для Перегляду Деталей Викладача**

  function viewTeacherDetails(id) {
    console.log('View Details clicked for id:', id);
    const teacher = validUsers.find(user => user.id === id);
    if (!teacher) {
      console.error('Teacher not found:', id);
      return;
    }
    openModalWithTeacherDetails(teacher);
  }

  // **5.7. Функція для Перемикання Статусу "Улюблений"**

  function toggleFavorite(id) {
    const teacher = validUsers.find(user => user.id === id);
    if (!teacher) {
      console.error('Teacher not found:', id);
      return;
    }
    teacher.favorite = !teacher.favorite;

    // Оновлюємо кнопку
    const toggleBtn = document.querySelector(`.toggle-favorite-btn[data-id="${id}"]`);
    if (toggleBtn) {
      toggleBtn.textContent = teacher.favorite ? 'Remove from favorites' : 'Add to favorites';
      toggleBtn.classList.toggle('remove-favorite', teacher.favorite);
      toggleBtn.classList.toggle('add-favorite', !teacher.favorite);
    }

    // Оновлюємо карусель
    const currentPageTeachers = getCurrentPageTeachers();
    updateCarousel(currentPageTeachers);
  }

  // **5.8. Функція для Видалення Викладача**

  async function deleteTeacher(id) {
    const index = validUsers.findIndex(user => user.id === id);
    if (index !== -1) {
      const confirmDelete = confirm('Are you sure you want to delete this teacher?');
      if (confirmDelete) {
        try {
          // Видаляємо викладача з сервера
          const response = await fetch(`http://localhost:3000/teachers/${id}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            throw new Error('Не вдалося видалити викладача з сервера.');
          }

          // Видаляємо з масиву validUsers
          validUsers.splice(index, 1);

          // Оновлюємо filteredTeachers
          filteredTeachers = filteredTeachers.filter(user => user.id !== id);

          // Перевіряємо, чи не перевищує currentPage кількість сторінок
          const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
          if (currentPage > totalPages) {
            currentPage = totalPages > 0 ? totalPages : 1;
          }

          // Відображаємо викладачів
          displayTeachers();

          console.log('Teacher deleted:', id);
        } catch (error) {
          console.error('Помилка при видаленні викладача:', error);
          alert('Сталася помилка при видаленні викладача. Спробуйте пізніше.');
        }
      }
    } else {
      console.error('Teacher not found:', id);
    }
  }

  // **5.9. Функція для Відкриття Модального Вікна з Деталями Викладача**

  function openModalWithTeacherDetails(teacher) {
    console.log('Opening modal for teacher:', teacher.full_name);
    const modal = document.getElementById('modal');
    const teacherDetails = document.getElementById('teacher-details');

    // Очищаємо попередні деталі
    teacherDetails.innerHTML = `
        <img src="${teacher.picture_large}" alt="${teacher.full_name}" />
        <h3>${teacher.full_name}</h3>
        <p><strong>Course:</strong> ${teacher.course}</p>
        <p><strong>Country:</strong> ${teacher.country}</p>
        <p><strong>Email:</strong> <a href="mailto:${teacher.email}">${teacher.email}</a></p>
        <p><strong>Age:</strong> ${teacher.age}</p>
        <p><strong>Gender:</strong> ${teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1)}</p>
        <p><strong>Phone:</strong> ${teacher.phone}</p>
        <p><strong>Address:</strong> ${teacher.city}, ${teacher.state}, ${teacher.country}, ${teacher.postcode}</p>
        <p><strong>Birth Date:</strong> ${new Date(teacher.b_date).toLocaleDateString()}</p>
        <p><strong>Note:</strong> ${teacher.note || 'N/A'}</p>
        <!-- Контейнер для карти -->
        <div id="teacher-map" class="teacher-map"></div>
    `;

    modal.style.display = "block";

    // Ініціалізація карти
    setTimeout(() => { // Використовуємо setTimeout для забезпечення наявності контейнера в DOM
      const mapElement = document.getElementById('teacher-map');
      if (mapElement) {
        const latitude = teacher.coordinates.latitude;
        const longitude = teacher.coordinates.longitude;

        // Перевірка валідності координат
        if (isValidLatitude(latitude) && isValidLongitude(longitude)) {
          // Якщо попередня карта існує, видаляємо її
          if (currentMap) {
            currentMap.remove();
            currentMap = null;
          }

          // Створюємо карту і зберігаємо її у глобальній змінній
          currentMap = L.map('teacher-map').setView([latitude, longitude], 13);

          // Додаємо шар карти (OpenStreetMap) з атрибуцією
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          }).addTo(currentMap);

          // Додаємо маркер
          L.marker([latitude, longitude]).addTo(currentMap)
              .bindPopup(`${teacher.full_name}`)
              .openPopup();
        } else {
          // Якщо координати некоректні
          mapElement.innerHTML = '<p>Invalid location data.</p>';
        }
      } else {
        // Якщо контейнер для карти недоступний
        console.warn('Map container not found.');
      }
    }, 0);
  }

  // **5.10. Закриття Модального Вікна**

  // Закриття модального вікна при натисканні на кнопку закриття
  document.querySelector('.close').addEventListener('click', function() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';

    // Видаляємо карту Leaflet, якщо вона існує
    if (currentMap) {
      currentMap.remove();
      currentMap = null;
    }
  });

  // Закриття модального вікна при натисканні поза ним
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
      modal.style.display = 'none';

      // Видаляємо карту Leaflet, якщо вона існує
      if (currentMap) {
        currentMap.remove();
        currentMap = null;
      }
    }
  });

  // **5.11. Фільтри та Пошук**

  const ageFilter = document.getElementById('age');
  const regionFilter = document.getElementById('region');
  const sexFilter = document.getElementById('sex');
  const photoFilter = document.querySelector('input[name="photo"]');
  const favoritesFilter = document.querySelector('input[name="favorites"]');
  const searchBtn = document.querySelector('.search-btn');
  const searchBar = document.querySelector('.search-bar');
  const clearFiltersBtn = document.querySelector('.clear-filters-btn');

  function updateTeacherList() {
    filteredTeachers = [...validUsers]; // Початково всі валідні користувачі

    if (ageFilter.value !== 'all') {
      const [minAge, maxAge] = ageFilter.value.split('-').map(Number);
      filteredTeachers = filteredTeachers.filter(user => user.age >= minAge && user.age <= maxAge);
    }

    if (regionFilter.value !== 'all') {
      const regions = {
        europe: ['Germany', 'Denmark', 'Norway', 'France', 'Switzerland', 'Ireland', 'Netherlands', 'Spain', 'Turkey'],
        asia: ['Iran', 'China', 'Japan', 'India', 'Vietnam', 'South Korea', 'Singapore'],
        america: ['United States', 'Canada', 'Brazil', 'Mexico', 'Argentina']
      };
      filteredTeachers = filteredTeachers.filter(user => regions[regionFilter.value].includes(user.country));
    }

    if (sexFilter.value !== 'all') {
      filteredTeachers = filteredTeachers.filter(user => user.gender === sexFilter.value);
    }

    if (photoFilter.checked) {
      filteredTeachers = filteredTeachers.filter(user => user.picture_large && user.picture_large !== 'default-avatar.png');
    }

    if (favoritesFilter.checked) {
      filteredTeachers = filteredTeachers.filter(user => user.favorite);
    }

    const searchQuery = searchBar.value.trim().toLowerCase();
    if (searchQuery) {
      filteredTeachers = filteredTeachers.filter(user =>
          user.full_name.toLowerCase().includes(searchQuery) ||
          (user.note && user.note.toLowerCase().includes(searchQuery)) ||
          user.age.toString().includes(searchQuery)
      );
    }

    // Скидаємо поточну сторінку на першу
    currentPage = 1;

    // Відображаємо викладачів
    displayTeachers();

    // Ініціалізуємо статистику
    initializeStatistics();
  }

  function clearFilters() {
    ageFilter.value = 'all';
    regionFilter.value = 'all';
    sexFilter.value = 'all';
    photoFilter.checked = false;
    favoritesFilter.checked = false;
    searchBar.value = '';
    updateTeacherList();
  }

  ageFilter.addEventListener('change', updateTeacherList);
  regionFilter.addEventListener('change', updateTeacherList);
  sexFilter.addEventListener('change', updateTeacherList);
  photoFilter.addEventListener('change', updateTeacherList);
  favoritesFilter.addEventListener('change', updateTeacherList);
  searchBtn.addEventListener('click', updateTeacherList);
  clearFiltersBtn.addEventListener('click', clearFilters);

  searchBar.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      updateTeacherList();
    }
  });

  let debounceTimeout;
  searchBar.addEventListener('input', function() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      updateTeacherList();
    }, 300);
  });

  // **5.12. Додавання Нового Викладача**

  // Вибір кнопок "Add Teacher"
  addTeacherBtn.forEach(button => {
    button.addEventListener('click', () => {
      addTeacherModal.style.display = 'block';
    });
  });

  // Закриття модального вікна при натисканні на кнопку закриття
  closeAddTeacherBtn.addEventListener('click', () => {
    addTeacherModal.style.display = 'none';
  });

  // Закриття модального вікна при натисканні поза ним
  window.addEventListener('click', (event) => {
    if (event.target == addTeacherModal) {
      addTeacherModal.style.display = 'none';
    }
  });

  // Функція для отримання викладачів на поточній сторінці
  function getCurrentPageTeachers() {
    const start = 0;
    const end = currentPage * itemsPerPage;
    return filteredTeachers.slice(start, end);
  }

  // Обробник події для форми додавання викладача
  addTeacherForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Отримуємо дані з форми
    const formData = new FormData(addTeacherForm);
    const teacherData = Object.fromEntries(formData.entries());

    // Валідація даних
    const errors = [];

    if (!teacherData.full_name.trim()) {
      errors.push('The "Full Name" field is required.');
    } else if (!isCapitalized(teacherData.full_name)) {
      errors.push('Full name should start with a capital letter.');
    }

    if (!['male', 'female'].includes(teacherData.gender)) {
      errors.push('Gender must be either "male" or "female".');
    }

    if (!isValidEmail(teacherData.email)) {
      errors.push('Invalid email format.');
    }

    if (!isValidPhone(teacherData.phone)) {
      errors.push('Invalid phone number format.');
    }

    if (!teacherData.country.trim()) {
      errors.push('The "Country" field is required.');
    } else if (!isCapitalized(teacherData.country)) {
      errors.push('Country should start with a capital letter.');
    }

    if (!teacherData.city.trim()) {
      errors.push('The "City" field is required.');
    } else if (!isCapitalized(teacherData.city)) {
      errors.push('City should start with a capital letter.');
    }

    if (teacherData.state && !isCapitalized(teacherData.state)) {
      errors.push('State should start with a capital letter.');
    }

    if (!teacherData.b_date) {
      errors.push('The "Birth Date" field is required.');
    }

    if (!teacherData.age || isNaN(teacherData.age)) {
      errors.push('A valid age is required.');
    }

    // Якщо є помилки, виводимо їх
    if (errors.length > 0) {
      alert('Please correct the following errors:\n' + errors.join('\n'));
      return;
    }

    // Отримуємо координати за допомогою геокодування
    const { latitude, longitude } = await getCoordinates(teacherData.city, teacherData.country);


    async function getCoordinates(city, country) {
      const encodedCity = encodeURIComponent(city);
      const encodedCountry = encodeURIComponent(country);

      const url = `https://nominatim.openstreetmap.org/search?city=${encodedCity}&country=${encodedCountry}&format=json&limit=1`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept-Language': 'en'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch coordinates.');
        }

        const data = await response.json();

        if (data.length === 0) {
          return { latitude: null, longitude: null };
        }

        const { lat, lon } = data[0];

        return {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        };
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        return { latitude: null, longitude: null };
      }
    }

    if (latitude === null || longitude === null) {
      alert('Could not determine coordinates for the provided city and country.');
      return;
    }

    // Перевіряємо валідність координат
    if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
      alert('Invalid coordinates obtained from the provided city and country.');
      return;
    }

    // Форматуємо дані викладача
    const newTeacher = {
      gender: teacherData.gender,
      title: '', // Можна додати поле "title" до форми, якщо необхідно
      full_name: teacherData.full_name,
      city: teacherData.city || '',
      state: teacherData.state || '',
      country: teacherData.country,
      postcode: teacherData.postcode || '',
      coordinates: {
        latitude: latitude,
        longitude: longitude
      },
      timezone: {
        offset: '',
        description: ''
      },
      email: teacherData.email,
      b_date: teacherData.b_date || '',
      age: parseInt(teacherData.age),
      phone: teacherData.phone,
      picture_large: 'default-avatar.png',
      picture_thumbnail: 'default-avatar.png',
      id: generateUniqueId(),
      favorite: false,
      course: courses[Math.floor(Math.random() * courses.length)],
      bg_color: getRandomColor(),
      note: teacherData.note || ''
    };

    try {
      // Відправляємо POST-запит на json-server
      const response = await fetch('http://localhost:3000/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTeacher)
      });

      if (!response.ok) {
        throw new Error('Failed to add teacher to the server.');
      }

      const savedTeacher = await response.json();

      // Додаємо нового викладача на початок масиву validUsers
      validUsers.unshift(savedTeacher);

      // Оновлюємо filteredTeachers
      updateTeacherList();

      // Закриваємо модальне вікно
      addTeacherModal.style.display = 'none';

      // Скидаємо форму
      addTeacherForm.reset();

      console.log('New teacher added:', savedTeacher);
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('An error occurred while adding the teacher. Please try again.');
    }
  });

  // **5.13. Функція для Оновлення Каруселі**

  function updateCarousel(currentPageTeachers) {
    const favoriteTeachers = currentPageTeachers.filter(user => user.favorite);
    carouselSlide.innerHTML = '';

    if (favoriteTeachers.length === 0) {
      carouselSlide.innerHTML = '<p>No favorite teachers available.</p>';
      leftArrow.style.display = 'none';
      rightArrow.style.display = 'none';
      return;
    }

    favoriteTeachers.forEach(teacher => {
      const slideItem = document.createElement('div');
      slideItem.classList.add('carousel-item');

      slideItem.innerHTML = `
        <img src="${teacher.picture_large}" alt="${teacher.full_name}">
        <h3>${teacher.full_name}</h3>
        <p>${teacher.country}</p>
      `;

      carouselSlide.appendChild(slideItem);
    });

    // Calculate total slides (кожна слайд групує 4 викладачів)
    const totalSlides = Math.ceil(favoriteTeachers.length / 4);

    // Update arrow visibility
    if (totalSlides <= 1) {
      leftArrow.style.display = 'none';
      rightArrow.style.display = 'none';
    } else {
      leftArrow.style.display = 'flex';
      rightArrow.style.display = 'flex';
    }

    // Reset to the first slide
    currentSlideIndex = 0;
    carouselSlide.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
  }

  let currentSlideIndex = 0;

  // **5.14. Обробники Кліків на Стрілки Каруселі**

  leftArrow.addEventListener('click', () => {
    const currentPageTeachers = getCurrentPageTeachers();
    const favoriteTeachers = currentPageTeachers.filter(user => user.favorite);
    const totalSlides = Math.ceil(favoriteTeachers.length / 4);
    if (totalSlides === 0) return;

    currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
    carouselSlide.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
  });

  rightArrow.addEventListener('click', () => {
    const currentPageTeachers = getCurrentPageTeachers();
    const favoriteTeachers = currentPageTeachers.filter(user => user.favorite);
    const totalSlides = Math.ceil(favoriteTeachers.length / 4);
    if (totalSlides === 0) return;

    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    carouselSlide.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
  });

  // **5.15. Обробник Кнопки "Next" для Пагінації**

  nextBtn.addEventListener('click', () => {
    currentPage += 1;
    displayTeachers(true); // Передаємо true, щоб не очищувати список
  });

  // **5.16. Функції для Статистики**

  function sortStatisticsTable(sortBy) {
    if (statisticsSort.column === sortBy) {
      statisticsSort.order = statisticsSort.order === 'ascending' ? 'descending' : 'ascending';
    } else {
      statisticsSort.column = sortBy;
      statisticsSort.order = 'ascending';
    }

    sortedStatisticsUsers = sortUsers([...filteredTeachers], sortBy, statisticsSort.order);
    statisticsCurrentPage = 1;
    clearStatistics();
    displayStatistics(sortedStatisticsUsers.slice(0, statisticsRowsPerPage));
    setupStatisticsPagination(sortedStatisticsUsers);
    updateStatisticsSortIndicators();
  }

  function updateStatisticsSortIndicators() {
    statisticsTableHeaders.forEach(header => {
      header.classList.remove('sorted-asc', 'sorted-desc');
      const sortBy = header.getAttribute('data-sort');
      if (sortBy === statisticsSort.column) {
        header.classList.add(statisticsSort.order === 'ascending' ? 'sorted-asc' : 'sorted-desc');
      }
    });
  }

  function sortUsers(users, sortBy, order = 'ascending') {
    return users.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      if (sortBy === 'b_date') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }

      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (order === 'ascending') {
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      } else if (order === 'descending') {
        if (valueA > valueB) return -1;
        if (valueA < valueB) return 1;
        return 0;
      } else {
        throw new Error("Order must be 'ascending' or 'descending'");
      }
    });
  }

  function displayStatistics(teachers) {
    // Додаємо нових викладачів до таблиці Statistics
    const statisticsTableBody = document.querySelector('#statistics-table tbody');

    teachers.forEach(teacher => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${teacher.full_name}</td>
        <td>${teacher.course}</td>
        <td>${teacher.age}</td>
        <td>${new Date(teacher.b_date).toLocaleDateString()}</td>
        <td>${teacher.country}</td>
      `;

      statisticsTableBody.appendChild(row);
    });
  }

  function clearStatistics() {
    const statisticsTableBody = document.querySelector('#statistics-table tbody');
    statisticsTableBody.innerHTML = '';
  }

  function initializeStatistics() {
    clearStatistics();
    sortedStatisticsUsers = [...filteredTeachers]; // Ініціалізуємо масив відсортованих користувачів
    statisticsCurrentPage = 1; // Встановлюємо поточну сторінку на 1
    displayStatistics(sortedStatisticsUsers.slice(0, statisticsRowsPerPage)); // Відображаємо першу сторінку
    setupStatisticsPagination(sortedStatisticsUsers); // Налаштовуємо пагінацію
  }

  function setupStatisticsPagination(sortedUsers) {
    // Очищуємо поточні пагінаційні кнопки
    statisticsPaginationContainer.innerHTML = '';

    const totalPages = Math.ceil(sortedUsers.length / statisticsRowsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const pageLink = document.createElement('a');
      pageLink.href = '#';
      pageLink.textContent = i;
      pageLink.classList.add('pagination-page');
      if (i === statisticsCurrentPage) {
        pageLink.classList.add('active');
      }
      pageLink.addEventListener('click', (e) => {
        e.preventDefault();
        statisticsCurrentPage = i;
        clearStatistics();
        const start = (statisticsCurrentPage - 1) * statisticsRowsPerPage;
        const end = start + statisticsRowsPerPage;
        displayStatistics(sortedUsers.slice(start, end));
        // Оновлюємо активну сторінку
        document.querySelectorAll('.pagination-page').forEach(link => link.classList.remove('active'));
        pageLink.classList.add('active');
      });
      statisticsPaginationContainer.appendChild(pageLink);
    }
  }

  // **5.17. Оновлення Статистики при Сортуванні**

  statisticsTableHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const sortBy = header.getAttribute('data-sort');
      if (sortBy) {
        sortStatisticsTable(sortBy);
      }
    });
  });

});
