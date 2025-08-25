import time
from playwright.sync_api import sync_playwright, expect

def verify_auth_flow(page):
    # Generate a unique email using the current timestamp
    unique_email = f"testuser_{int(time.time())}@example.com"
    password = "password123"
    name = "Test User"

    # --- Registration ---
    print("Navigating to signup page...")
    page.goto("http://localhost:3000/signup")

    print("Filling out registration form...")
    page.get_by_label("Nome").fill(name)
    page.get_by_label("Email").fill(unique_email)
    page.get_by_label("Senha", exact=True).fill(password)
    page.get_by_label("Confirmar senha").fill(password)

    print("Submitting registration form...")
    page.get_by_role("button", name="Criar conta").click()

    # Wait for navigation to the app page
    print("Verifying registration success...")
    page.wait_for_url("**/app", timeout=10000)

    # Now that we are on the right URL, wait for the element
    perfil_link = page.get_by_role("link", name="Perfil")
    expect(perfil_link).to_be_visible()
    print("Registration successful.")

    # --- Navigate to Profile Page ---
    print("Navigating to profile page...")
    page.get_by_role("link", name="Perfil").click()
    page.wait_for_url("**/opcoes", timeout=10000)

    # --- Logout ---
    print("Logging out...")
    page.get_by_role("button", name="Sair").click()

    print("Verifying logout success...")
    # After logout, we should be redirected to the login page
    expect(page.get_by_role("heading", name="Bem-vindo de volta")).to_be_visible(timeout=10000)
    print("Logout successful.")


    # --- Login ---
    print("Navigating to login page...")
    page.goto("http://localhost:3000/login")

    print("Filling out login form...")
    page.get_by_label("Email").fill(unique_email)
    page.get_by_label("Senha").fill(password)

    print("Submitting login form...")
    page.get_by_role("button", name="Entrar").click()

    print("Verifying login success...")
    page.wait_for_url("**/app", timeout=10000)
    expect(page.get_by_role("link", name="Perfil")).to_be_visible(timeout=10000)
    print("Login successful.")

    # --- Verify Profile Page ---
    print("Navigating to profile page...")
    page.get_by_role("link", name="Perfil").click()
    page.wait_for_url("**/opcoes", timeout=10000)

    print("Verifying user data on profile page...")
    expect(page.get_by_text(name)).to_be_visible()
    expect(page.get_by_text(unique_email)).to_be_visible()

    print("Taking screenshot...")
    page.screenshot(path="jules-scratch/verification/verification.png")
    print("Screenshot taken.")


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_auth_flow(page)
        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
            raise
        finally:
            browser.close()
