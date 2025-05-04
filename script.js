const API_KEY = '06ea4845b98e45a988764732250405';
const BASE_URL = 'http://api.weatherapi.com/v1';
const FORECAST_URL = `${BASE_URL}/forecast.json`;
const CURRENT_URL = `${BASE_URL}/current.json`;

// DOM Elements
const searchInput = document.querySelector('.search-box input');
const searchButton = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const preloader = document.querySelector('.preloader');
const preloaderSound = document.getElementById('preloader-sound');
const errorCard = document.querySelector('.error-card');
const closeError = document.querySelector('.close-error');
const forecastContainer = document.querySelector('.forecast-container');
const weeklyForecast = document.querySelector('.weekly-forecast');
const cursor = document.querySelector('.cursor');
const themeOptions = document.querySelectorAll('.theme-option');
let hoverTimer;
let isHovering = false;

// Weather icons mapping
const weatherIcons = {
    'Sunny': 'fa-sun',
    'Clear': 'fa-moon',
    'Partly cloudy': 'fa-cloud-sun',
    'Cloudy': 'fa-cloud',
    'Overcast': 'fa-cloud',
    'Mist': 'fa-smog',
    'Patchy rain possible': 'fa-cloud-rain',
    'Patchy snow possible': 'fa-snowflake',
    'Patchy sleet possible': 'fa-cloud-meatball',
    'Patchy freezing drizzle possible': 'fa-cloud-meatball',
    'Thundery outbreaks possible': 'fa-bolt',
    'Blowing snow': 'fa-snowflake',
    'Blizzard': 'fa-snowflake',
    'Fog': 'fa-smog',
    'Freezing fog': 'fa-smog',
    'Patchy light drizzle': 'fa-cloud-rain',
    'Light drizzle': 'fa-cloud-rain',
    'Freezing drizzle': 'fa-cloud-meatball',
    'Heavy freezing drizzle': 'fa-cloud-meatball',
    'Patchy light rain': 'fa-cloud-rain',
    'Light rain': 'fa-cloud-rain',
    'Moderate rain at times': 'fa-cloud-rain',
    'Moderate rain': 'fa-cloud-rain',
    'Heavy rain at times': 'fa-cloud-showers-heavy',
    'Heavy rain': 'fa-cloud-showers-heavy',
    'Light freezing rain': 'fa-cloud-meatball',
    'Moderate or heavy freezing rain': 'fa-cloud-meatball',
    'Light sleet': 'fa-cloud-meatball',
    'Moderate or heavy sleet': 'fa-cloud-meatball',
    'Patchy light snow': 'fa-snowflake',
    'Light snow': 'fa-snowflake',
    'Patchy moderate snow': 'fa-snowflake',
    'Moderate snow': 'fa-snowflake',
    'Patchy heavy snow': 'fa-snowflake',
    'Heavy snow': 'fa-snowflake',
    'Ice pellets': 'fa-cloud-meatball',
    'Light rain shower': 'fa-cloud-rain',
    'Moderate or heavy rain shower': 'fa-cloud-showers-heavy',
    'Torrential rain shower': 'fa-cloud-showers-heavy',
    'Light sleet showers': 'fa-cloud-meatball',
    'Moderate or heavy sleet showers': 'fa-cloud-meatball',
    'Light snow showers': 'fa-snowflake',
    'Moderate or heavy snow showers': 'fa-snowflake',
    'Light showers of ice pellets': 'fa-cloud-meatball',
    'Moderate or heavy showers of ice pellets': 'fa-cloud-meatball',
    'Patchy light rain with thunder': 'fa-bolt',
    'Moderate or heavy rain with thunder': 'fa-bolt',
    'Patchy light snow with thunder': 'fa-bolt',
    'Moderate or heavy snow with thunder': 'fa-bolt'
};

// Play preloader sound and hide preloader after page load
window.addEventListener('load', () => {
    preloaderSound.play();
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
            preloaderSound.pause();
        }, 500);
    }, 2000);
});

// Function to show error card
function showError(message) {
    errorCard.querySelector('.error-message').textContent = message;
    errorCard.classList.add('show');
    setTimeout(() => {
        errorCard.classList.remove('show');
    }, 3000);
}

// Close error card
closeError.addEventListener('click', () => {
    errorCard.classList.remove('show');
});

// Function to update time display
function updateTimeDisplay(localTime) {
    const localTimeElement = document.querySelector('.local-time .time');
    const yourTimeElement = document.querySelector('.your-time .time');
    
    const localDate = new Date(localTime);
    const yourDate = new Date();
    
    localTimeElement.textContent = localDate.toLocaleTimeString();
    yourTimeElement.textContent = yourDate.toLocaleTimeString();
}

// Function to create forecast card
function createForecastCard(forecast) {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    
    const date = new Date(forecast.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    card.innerHTML = `
        <div class="day">${dayName}</div>
        <i class="fas ${weatherIcons[forecast.day.condition.text] || 'fa-cloud'}"></i>
        <div class="temp">${Math.round(forecast.day.avgtemp_c)}°C</div>
        <div class="condition">${forecast.day.condition.text}</div>
    `;
    
    return card;
}

// Function to update forecast display
function updateForecastDisplay(forecastData) {
    forecastContainer.innerHTML = '';
    forecastData.forecast.forecastday.forEach(day => {
        const card = createForecastCard(day);
        forecastContainer.appendChild(card);
    });
    weeklyForecast.classList.add('show');
}

// Function to fetch weather data
async function fetchWeather(city) {
    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`${CURRENT_URL}?key=${API_KEY}&q=${city}`),
            fetch(`${FORECAST_URL}?key=${API_KEY}&q=${city}&days=7`)
        ]);
        
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        
        if (currentData.error || forecastData.error) {
            throw new Error(currentData.error?.message || forecastData.error?.message);
        }
        
        return { current: currentData, forecast: forecastData };
    } catch (error) {
        throw error;
    }
}

// Function to update weather display
function updateWeatherDisplay(data) {
    const { current, forecast } = data;
    
    // Set theme based on weather condition
    const condition = current.current.condition.text.toLowerCase();
    if (condition.includes('sunny') || condition.includes('clear')) {
        document.documentElement.setAttribute('data-theme', 'sunny');
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
        document.documentElement.setAttribute('data-theme', 'rainy');
    } else {
        document.documentElement.setAttribute('data-theme', 'cloudy');
    }
    
    // Update current weather
    document.querySelector('.temp').textContent = Math.round(current.current.temp_c);
    
    const weatherDesc = document.querySelector('.weather-desc');
    const weatherIcon = document.querySelector('.description i');
    weatherDesc.textContent = current.current.condition.text;
    weatherIcon.className = `fas ${weatherIcons[current.current.condition.text] || 'fa-cloud'}`;
    
    document.querySelector('.city').textContent = `${current.location.name}, ${current.location.country}`;
    
    document.querySelector('.humidity-value').textContent = `${current.current.humidity}%`;
    document.querySelector('.wind-value').textContent = `${current.current.wind_kph} km/h`;
    
    // Update time display
    updateTimeDisplay(current.location.localtime);
    
    // Update forecast
    updateForecastDisplay(forecast);
    
    // Show weather box with animation
    weatherBox.style.opacity = '1';
    weatherBox.style.transform = 'translateY(0)';
}

// Event listeners
searchButton.addEventListener('click', async () => {
    const city = searchInput.value.trim();
    if (!city) return;
    
    try {
        const data = await fetchWeather(city);
        updateWeatherDisplay(data);
    } catch (error) {
        showError(error.message);
        weeklyForecast.classList.remove('show');
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});

// Initial weather for default city
fetchWeather('London')
    .then(updateWeatherDisplay)
    .catch(error => showError(error.message));

// Cursor animation
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Reset hover timer when moving
    if (hoverTimer) {
        clearTimeout(hoverTimer);
        isHovering = false;
    }
});

// Star burst effect on hover
document.addEventListener('mousemove', (e) => {
    if (!e.target.closest('.container')) {
        if (!isHovering) {
            hoverTimer = setTimeout(() => {
                isHovering = true;
                createStarBurst(e.clientX, e.clientY);
            }, 2000);
        }
    }
});

function createStarBurst(x, y) {
    const burst = document.createElement('div');
    burst.className = 'star-burst';
    burst.style.left = x + 'px';
    burst.style.top = y + 'px';
    
    // Create multiple stars in a circular pattern
    for (let i = 0; i < 8; i++) {
        const star = document.createElement('i');
        star.className = 'fas fa-star';
        const angle = (i * 45) * (Math.PI / 180);
        const radius = 30;
        star.style.left = Math.cos(angle) * radius + 'px';
        star.style.top = Math.sin(angle) * radius + 'px';
        star.style.animationDelay = (i * 0.1) + 's';
        burst.appendChild(star);
    }
    
    document.body.appendChild(burst);
    
    // Remove the burst after animation
    setTimeout(() => {
        burst.remove();
        isHovering = false;
    }, 1000);
}

// Star animation on click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.container')) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = e.clientX + 'px';
        star.style.top = e.clientY + 'px';
        star.innerHTML = '<i class="fas fa-star"></i>';
        document.body.appendChild(star);
        
        setTimeout(() => {
            star.remove();
        }, 1000);
    }
});

// Theme switching
themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        document.documentElement.setAttribute('data-theme', theme);
    });
}); 