  // Lab2.js

  // **1. Константи та Допоміжні Функції**

  const courses = [
    'Mathematics', 'Physics', 'English', 'Computer Science', 'Dancing',
    'Chess', 'Biology', 'Chemistry', 'Law', 'Art', 'Medicine', 'Statistics'
  ];

  // Функція для генерації випадкового кольору
  function getRandomColor() {
    return '#' + _.sampleSize('0123456789ABCDEF', 6).join('');
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

  // **Функція для розрахунку днів до наступного дня народження**
  function daysUntilNextBirthday(birthDate) {
    const today = dayjs();
    const birthdayThisYear = dayjs(birthDate).year(today.year());

    // Якщо день народження цього року вже минув або сьогодні, беремо наступний рік
    const nextBirthday = birthdayThisYear.isBefore(today, 'day') || birthdayThisYear.isSame(today, 'day')
        ? birthdayThisYear.add(1, 'year')
        : birthdayThisYear;

    return nextBirthday.diff(today, 'day');
  }

  // Функція для отримання правильного суфіксу для слова "день"
  function getDaySuffix(days) {
    if (days % 10 === 1 && days % 100 !== 11) {
      return 'день';
    } else if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) {
      return 'дні';
    } else {
      return 'днів';
    }
  }

  // **2. Глобальні Змінні**

  let validUsers = []; // Всі валідні користувачі
  let filteredTeachers = []; // Використовується для фільтрації
  let currentPage = 1; // Поточна сторінка пагінації
  const itemsPerPage = 10; // Кількість викладачів на сторінку

  // Змінна для поточної карти у модальному вікні
  let currentMap = null;

  // Глобальна змінна для графіка
  let statisticsChart = null;

  // **3. Функція для Форматування Користувача**

  function formatUser(user) {
    const parsedLatitude = parseFloat(user.location.coordinates.latitude);
    const parsedLongitude = parseFloat(user.location.coordinates.longitude);

    return {
      gender: user.gender || '',
      title: user.name.title || '',
      full_name: _.join([user.name.first || '', user.name.last || ''], ' ').trim(),
      city: user.location.city || '',
      state: user.location.state || '',
      country: user.location.country || '',
      postcode: user.location.postcode || '',
      coordinates: {
        latitude: !_.isNaN(parsedLatitude) ? parsedLatitude : null,
        longitude: !_.isNaN(parsedLongitude) ? parsedLongitude : null
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
      course: _.sample(courses),
      bg_color: getRandomColor(),
      note: ''
      // Не зберігаємо daysUntilBirthday тут, оскільки він обчислюється динамічно
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
    // Правильна деструктуризація: масив з двох елементів
    const [valid, invalid] = _.partition(users, user => isValidUser(user));

    // Додавання помилок до невалідних користувачів
    const invalidWithErrors = _.map(invalid, user => {
      const errors = [];

      if (!_.isString(user.full_name) || _.trim(user.full_name) === '') {
        errors.push('Full name should be a non-empty string.');
      } else if (!isCapitalized(user.full_name)) {
        errors.push('Full name should start with a capital letter.');
      }

      if (!_.isString(user.gender) || !['male', 'female'].includes(user.gender.toLowerCase())) {
        errors.push('Gender should be either "male" or "female".');
      }

      if (!_.isString(user.city) || _.trim(user.city) === '') {
        errors.push('City should be a non-empty string.');
      } else if (!isCapitalized(user.city)) {
        errors.push('City should start with a capital letter.');
      }

      if (user.state) {
        if (!_.isString(user.state)) {
          errors.push('State should be a string.');
        } else if (_.trim(user.state) !== '' && !isCapitalized(user.state)) {
          errors.push('State should start with a capital letter.');
        }
      }

      if (!_.isString(user.country) || _.trim(user.country) === '') {
        errors.push('Country should be a non-empty string.');
      } else if (!isCapitalized(user.country)) {
        errors.push('Country should start with a capital letter.');
      }

      if (user.note) {
        if (!_.isString(user.note)) {
          errors.push('Note should be a string.');
        } else if (_.trim(user.note) !== '' && !isCapitalized(user.note)) {
          errors.push('Note should start with a capital letter.');
        }
      }

      if (!_.isNumber(user.age) || _.isNaN(user.age)) {
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
        if (!isValidLatitude(lat) || !isValidLongitude(lon)) {
          errors.push('Coordinates are not valid.');
        }
      } else {
        errors.push('Coordinates are missing.');
      }

      return { ...user, validationErrors: errors };
    });

    return { validUsers: valid, invalidUsers: invalidWithErrors };
  }

  // Допоміжна функція для перевірки валідності користувача
  function isValidUser(user) {
    return (
        _.isString(user.full_name) && _.trim(user.full_name) !== '' && isCapitalized(user.full_name) &&
        _.isString(user.gender) && ['male', 'female'].includes(user.gender.toLowerCase()) &&
        _.isString(user.city) && _.trim(user.city) !== '' && isCapitalized(user.city) &&
        (_.isString(user.state) ? (_.trim(user.state) === '' || isCapitalized(user.state)) : true) &&
        _.isString(user.country) && _.trim(user.country) !== '' && isCapitalized(user.country) &&
        (!user.note || (_.isString(user.note) && (_.trim(user.note) === '' || isCapitalized(user.note)))) &&
        _.isNumber(user.age) && !_.isNaN(user.age) &&
        isValidPhone(user.phone) &&
        isValidEmail(user.email) &&
        user.b_date &&
        user.coordinates &&
        isValidLatitude(user.coordinates.latitude) &&
        isValidLongitude(user.coordinates.longitude)
    );
  }

  // **5. Основна Функція Після Завантаження DOM**

  document.addEventListener('DOMContentLoaded', () => {
    // **5.1. Вибір Елементів DOM**

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

        // Перевірка наявності data.results
        const formattedUsers = _.map(_.get(data, 'results', []), formatUser);

        // Валідуємо користувачів з використанням Lodash
        const { validUsers: validatedUsers, invalidUsers } = validateUsers(formattedUsers);

        console.log(`Валідні користувачі: ${_.get(validatedUsers, 'length', 0)}`);
        console.log(`Невалідні користувачі: ${_.get(invalidUsers, 'length', 0)}`);

        // Виводимо помилки валідації
        _.forEach(invalidUsers, user => {
          console.log(`User ${user.full_name} has validation errors:`, user.validationErrors);
        });

        // Крок 2: Відправляємо валідованих викладачів на json-server
        await Promise.all(_.map(validatedUsers, user => sendUserToServer(user)));

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

        // Валідуємо користувачів з використанням Lodash
        const { validUsers: validatedUsers, invalidUsers } = validateUsers(data);

        console.log(`Валідні користувачі з сервера: ${_.get(validatedUsers, 'length', 0)}`);
        console.log(`Невалідні користувачі з сервера: ${_.get(invalidUsers, 'length', 0)}`);

        // Очищаємо масив validUsers та додаємо отриманих з сервера, обмежуючи до 50
        validUsers = _.take(validatedUsers, 50); // Обмежуємо до 50 викладачів

        // Виводимо помилки валідації
        _.forEach(invalidUsers, user => {
          console.log(`User ${user.full_name} has validation errors:`, user.validationErrors);
        });

        // Встановлюємо filteredTeachers
        filteredTeachers = _.clone(validUsers);

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
      const start = (currentPage - 1) * itemsPerPage;
      const end = currentPage * itemsPerPage;
      const teachersToDisplay = _.slice(filteredTeachers, start, end);

      // Додаємо викладачів до списку
      _.forEach(teachersToDisplay, teacher => {
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
      const allDisplayedTeachers = _.slice(filteredTeachers, 0, end);
      updateCarousel(allDisplayedTeachers);
      initializeStatistics(); // Ця функція вже викликає createPieChart()
    }

    // **5.5. Функція для Створення Карти Викладача в Модальному Вікні**

    function createTeacherCard(teacher) {
      const teacherCard = document.createElement('div');
      teacherCard.classList.add('teacher-card');
      teacherCard.setAttribute('data-teacher-id', teacher.id);
      teacherCard.setAttribute('id', `teacher-${teacher.id}`); // Унікальний ID для картки

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
      const viewDetailsBtn = event.target.closest('.view-details-btn');
      if (viewDetailsBtn) {
        const id = viewDetailsBtn.getAttribute('data-id');
        viewTeacherDetails(id);
      }

      const toggleFavoriteBtn = event.target.closest('.toggle-favorite-btn');
      if (toggleFavoriteBtn) {
        const id = toggleFavoriteBtn.getAttribute('data-id');
        toggleFavorite(id);
      }

      const deleteTeacherBtn = event.target.closest('.delete-teacher-btn');
      if (deleteTeacherBtn) {
        const id = deleteTeacherBtn.getAttribute('data-id');
        deleteTeacher(id);
      }
    });



    // **5.6. Функція для Перегляду Деталей Викладача**

    function viewTeacherDetails(id) {
      console.log('View Details clicked for id:', id);
      const teacher = _.find(validUsers, { id });
      if (!teacher) {
        console.error('Teacher not found:', id);
        return;
      }
      openModalWithTeacherDetails(teacher);
    }

    // **5.7. Функція для Перемикання Статусу "Улюблений"**

    function toggleFavorite(id) {
      const teacher = _.find(validUsers, { id });
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

      // Оновлюємо графік статистики
      createPieChart();
    }

    // **5.8. Функція для Видалення Викладача**

    async function deleteTeacher(id) {
      const index = _.findIndex(validUsers, { id });
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
            _.pullAt(validUsers, index);

            // Оновлюємо filteredTeachers
            filteredTeachers = _.filter(filteredTeachers, user => user.id !== id);

            // Перевіряємо, чи не перевищує currentPage кількість сторінок
            const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
            if (currentPage > totalPages) {
              currentPage = totalPages > 0 ? totalPages : 1;
            }

            // Відображаємо викладачів
            displayTeachers();

            // Оновлюємо графік статистики
            createPieChart();

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

      // Розрахунок днів до наступного дня народження
      const daysUntilBirthday = daysUntilNextBirthday(teacher.b_date);

      teacherDetails.innerHTML = `
              <img src="${teacher.picture_large}" alt="${teacher.full_name}" />
              <h3>${teacher.full_name}</h3>
              <p><strong>Course:</strong> ${teacher.course}</p>
              <p><strong>Country:</strong> ${teacher.country}</p>
              <p><strong>Email:</strong> <a href="mailto:${teacher.email}">${teacher.email}</a></p>
              <p><strong>Age:</strong> ${teacher.age}</p>
              <p><strong>Gender:</strong> ${_.capitalize(teacher.gender)}</p>
              <p><strong>Phone:</strong> ${teacher.phone}</p>
              <p><strong>Address:</strong> ${teacher.city}, ${teacher.state}, ${teacher.country}, ${teacher.postcode}</p>
              <p><strong>Birth Date:</strong> ${new Date(teacher.b_date).toLocaleDateString()}</p>
              <p class="birthday-info">
                  <strong>Days until next birthday:</strong> 
                  ${daysUntilBirthday === 0
          ? 'Happy Birthday!'
          : `${daysUntilBirthday} ${getDaySuffix(daysUntilBirthday)}`
      }
              </p>
              <!-- Контейнер для карти -->
              <div id="teacher-map" class="teacher-map"></div>
          `;

      // Зберігаємо поточний ID викладача в модальному вікні
      modal.setAttribute('data-teacher-id', teacher.id);

      // Додаємо клас .show для анімації
      modal.classList.add('show');

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
      modal.classList.remove('show');

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
        modal.classList.remove('show');

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
      filteredTeachers = _.clone(validUsers); // Початково всі валідні користувачі

      // Фільтрація за віком
      if (ageFilter.value !== 'all') {
        const [minAge, maxAge] = _.map(_.split(ageFilter.value, '-'), _.toNumber);
        filteredTeachers = _.filter(filteredTeachers, user => user.age >= minAge && user.age <= maxAge);
      }

      // Фільтрація за регіоном
      if (regionFilter.value !== 'all') {
        const regions = {
          europe: ['Germany', 'Denmark', 'Norway', 'France', 'Switzerland', 'Ireland', 'Netherlands', 'Spain', 'Turkey'],
          asia: ['Iran', 'China', 'Japan', 'India', 'Vietnam', 'South Korea', 'Singapore'],
          america: ['United States', 'Canada', 'Brazil', 'Mexico', 'Argentina']
        };
        filteredTeachers = _.filter(filteredTeachers, user => _.includes(regions[regionFilter.value], user.country));
      }

      // Фільтрація за статтю
      if (sexFilter.value !== 'all') {
        filteredTeachers = _.filter(filteredTeachers, { gender: sexFilter.value });
      }

      // Фільтрація за наявністю фото
      if (photoFilter.checked) {
        filteredTeachers = _.filter(filteredTeachers, user => user.picture_large && user.picture_large !== 'default-avatar.png');
      }

      // Фільтрація за улюбленими
      if (favoritesFilter.checked) {
        filteredTeachers = _.filter(filteredTeachers, { favorite: true });
      }

      // Пошук
      const searchQuery = _.toLower(_.trim(searchBar.value));
      if (searchQuery) {
        filteredTeachers = _.filter(filteredTeachers, user =>
            _.includes(_.toLower(user.full_name), searchQuery) ||
            (_.get(user, 'note') && _.includes(_.toLower(user.note), searchQuery)) ||
            _.includes(_.toString(user.age), searchQuery)
        );
      }

      // Скидаємо поточну сторінку на першу
      currentPage = 1;

      // Відображаємо викладачів
      displayTeachers();

      // Створюємо або оновлюємо pie chart
      createPieChart();
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
      return _.slice(filteredTeachers, start, end);
    }

    // Обробник події для форми додавання викладача
    addTeacherForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Отримуємо дані з форми
      const formData = new FormData(addTeacherForm);
      const teacherData = _.fromPairs(Array.from(formData.entries()));

      // Валідація даних
      const errors = [];

      if (!_.trim(teacherData.full_name)) {
        errors.push('The "Full Name" field is required.');
      } else if (!isCapitalized(teacherData.full_name)) {
        errors.push('Full name should start with a capital letter.');
      }

      if (!_.includes(['male', 'female'], teacherData.gender)) {
        errors.push('Gender must be either "male" or "female".');
      }

      if (!isValidEmail(teacherData.email)) {
        errors.push('Invalid email format.');
      }

      if (!isValidPhone(teacherData.phone)) {
        errors.push('Invalid phone number format.');
      }

      if (!_.trim(teacherData.country)) {
        errors.push('The "Country" field is required.');
      } else if (!isCapitalized(teacherData.country)) {
        errors.push('Country should start with a capital letter.');
      }

      if (!_.trim(teacherData.city)) {
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

      if (!teacherData.age || _.isNaN(Number(teacherData.age))) {
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
        const encodedCity = _.escape(city);
        const encodedCountry = _.escape(country);

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

          if (_.isEmpty(data)) {
            return { latitude: null, longitude: null };
          }

          const { lat, lon } = data[0];

          return {
            latitude: _.toNumber(lat),
            longitude: _.toNumber(lon)
          };
        } catch (error) {
          console.error('Error fetching coordinates:', error);
          return { latitude: null, longitude: null };
        }
      }

      if (_.isNull(latitude) || _.isNull(longitude)) {
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
        course: _.sample(courses),
        bg_color: getRandomColor(),
        note: ''
        // Не зберігаємо daysUntilBirthday тут, оскільки він обчислюється динамічно
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
        validUsers = _.concat([savedTeacher], validUsers);

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
      const favoriteTeachers = _.filter(currentPageTeachers, { favorite: true });
      carouselSlide.innerHTML = '';

      if (_.isEmpty(favoriteTeachers)) {
        carouselSlide.innerHTML = '<p>No favorite teachers available.</p>';
        leftArrow.style.display = 'none';
        rightArrow.style.display = 'none';
        return;
      }

      _.forEach(favoriteTeachers, teacher => {
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
      const totalSlides = Math.ceil(_.size(favoriteTeachers) / 4);

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
      const favoriteTeachers = _.filter(currentPageTeachers, { favorite: true });
      const totalSlides = Math.ceil(_.size(favoriteTeachers) / 4);
      if (totalSlides === 0) return;

      currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
      carouselSlide.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    });

    rightArrow.addEventListener('click', () => {
      const currentPageTeachers = getCurrentPageTeachers();
      const favoriteTeachers = _.filter(currentPageTeachers, { favorite: true });
      const totalSlides = Math.ceil(_.size(favoriteTeachers) / 4);
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

    // Функція для створення pie chart
    function createPieChart() {
      // Отримуємо контекст канвасу
      const ctx = document.getElementById('statistics-chart').getContext('2d');

      // Збираємо дані для графіка
      const courseCounts = _.countBy(filteredTeachers, 'course');

      const courses = _.keys(courseCounts);
      const counts = _.values(courseCounts);

      // Генерація випадкових кольорів для кожного сегмента
      const backgroundColors = _.map(courses, () => getRandomColor());

      if (statisticsChart) {
        // Якщо графік вже існує, оновлюємо його дані
        statisticsChart.data.labels = courses;
        statisticsChart.data.datasets[0].data = counts;
        statisticsChart.data.datasets[0].backgroundColor = backgroundColors;
        statisticsChart.update();
      } else {
        // Створюємо новий pie chart
        statisticsChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: courses,
            datasets: [{
              data: counts,
              backgroundColor: backgroundColors,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
              },
              title: {
                display: true,
                text: 'Розподіл викладачів за спеціальностями'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed;
                    const total = _.sum(context.chart.data.datasets[0].data);
                    const percentage = ((value / total) * 100).toFixed(2);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          },
        });
      }
    }

    // Функція для сортування користувачів (залишено без змін)
    function sortUsers(users, sortBy, order = 'ascending') {
      return _.orderBy(users, [sortBy], [order === 'ascending' ? 'asc' : 'desc']);
    }

    // **5.16.1. Функція `initializeStatistics`**

    function initializeStatistics() {
      // Створюємо або оновлюємо pie chart
      createPieChart();
    }

    // **5.17. Оновлення Статистики при Фільтрації**

    // Після кожного оновлення фільтрів ми вже викликаємо `createPieChart()`
    // Тому додаткові виклики не потрібні

    // **Додатково: Оновлення днів до наступного дня народження у модальному вікні**

    // Якщо ви хочете, щоб кількість днів до дня народження оновлювалася щоденно без перезавантаження сторінки
    // Ви можете додати функцію, яка буде оновлювати це поле кожного дня

    // Приклад:
    setInterval(() => {
      const modal = document.getElementById('modal');
      if (modal.classList.contains('show')) {
        const teacherId = modal.getAttribute('data-teacher-id');
        const teacher = _.find(validUsers, { id: teacherId });
        if (teacher) {
          const daysUntilBirthday = daysUntilNextBirthday(teacher.b_date);
          const birthdayInfoElement = modal.querySelector('.birthday-info');
          if (birthdayInfoElement) {
            birthdayInfoElement.innerHTML = `
                          <strong>Days until next birthday:</strong> 
                          ${daysUntilBirthday === 0
                ? 'Happy Birthday!'
                : `${daysUntilBirthday} ${getDaySuffix(daysUntilBirthday)}`
            }
                      `;
          }
        }
      }
    }, 24 * 60 * 60 * 1000); // Оновлюємо кожні 24 години

  });
