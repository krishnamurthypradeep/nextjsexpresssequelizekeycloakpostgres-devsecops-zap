import pytest
import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

APP_URL = "http://localhost:3000"
KEYCLOAK_USERNAME = "pradeep"
KEYCLOAK_PASSWORD = "admin123"


@pytest.fixture
def driver():
    """Setup and teardown for Selenium WebDriver."""
    service = Service(ChromeDriverManager().install())
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # comment out to watch the browser
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=service, options=options)
    yield driver
    driver.quit()


def save_debug(driver, name: str):
    """Save screenshot + HTML for debugging."""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    driver.save_screenshot(f"debug_{name}_{timestamp}.png")
    with open(f"debug_{name}_{timestamp}.html", "w", encoding="utf-8") as f:
        f.write(driver.page_source)


def test_unauthenticated_shows_login(driver):
    driver.get(APP_URL)

    try:
        login_button = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located(
                (By.XPATH, "//button[contains(text(),'Login with Keycloak')]")
            )
        )
        assert login_button.is_displayed()
    except Exception:
        save_debug(driver, "unauthenticated")
        raise


def test_authenticated_shows_products_and_logout(driver):
    driver.get(APP_URL)

    try:
        # Step 1: Login button
        login_button = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(),'Login with Keycloak')]")
            )
        )
        login_button.click()

        # Step 2: Keycloak login form
        username_input = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "username"))
        )
        password_input = driver.find_element(By.ID, "password")

        username_input.send_keys(KEYCLOAK_USERNAME)
        password_input.send_keys(KEYCLOAK_PASSWORD)

        driver.find_element(By.ID, "kc-login").click()

        # Step 3: Handle OTP setup if required
        try:
            otp_field = WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.ID, "totp"))
            )

            print("\n⚡ OTP required! Please enter code from authenticator app.\n")
            otp_code = input("Enter the OTP from your authenticator app: ")

            otp_field.send_keys(otp_code)

            # Provide device label if this is first-time TOTP setup
            try:
                device_input = driver.find_element(By.ID, "userLabel")
                device_input.send_keys("SeleniumDevice")
            except Exception:
                pass

            driver.find_element(By.ID, "saveTOTPBtn").click()

        except Exception:
            print("\nℹ️ No OTP page detected, continuing login flow...\n")
            save_debug(driver, "no_otp")

        # Step 4: Save snapshot after login attempt
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        save_debug(driver, "after_login")

        # Step 5: Wait for Products page
        header = WebDriverWait(driver, 30).until(
            EC.visibility_of_element_located(
                (By.XPATH, "//h1[contains(text(),'Products')]")
            )
        )
        assert header.is_displayed()

        # Step 6: Verify products exist
        products = WebDriverWait(driver, 20).until(
            EC.presence_of_all_elements_located(
                (By.CSS_SELECTOR, ".product-card, .product-item")
            )
        )
        assert len(products) > 0, "No products loaded"

        # Step 7: Logout
        logout_button = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(),'Logout')]")
            )
        )
        logout_button.click()

        # Step 8: Verify back to login page
        login_button = WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located(
                (By.XPATH, "//button[contains(text(),'Login with Keycloak')]")
            )
        )
        assert login_button.is_displayed()

    except Exception:
        save_debug(driver, "authenticated")
        raise
