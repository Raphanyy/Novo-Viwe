import time
from playwright.sync_api import sync_playwright, expect

def verify_internal_pages(page):
    # --- Login ---
    print("Logging in...")
    unique_email = f"testuser_{int(time.time())}@example.com"
    password = "password123"
    name = "Test User"

    # First, register a new user
    page.goto("http://localhost:3000/signup")
    page.get_by_label("Nome").fill(name)
    page.get_by_label("Email").fill(unique_email)
    page.get_by_label("Senha", exact=True).fill(password)
    page.get_by_label("Confirmar senha").fill(password)
    page.get_by_role("button", name="Criar conta").click()
    page.wait_for_url("**/app", timeout=10000)
    print("Login successful.")

    # --- Dashboard Verification ---
    print("Verifying Dashboard page...")
    # The "Rotas este mês" stat should be 0 for a new user.
    # The value is inside a <p> tag.
    # The structure is: h4 with text "Rotas este mês", then a p with the value.
    # We can use a locator that finds the h4 and then finds the next p sibling.
    # A simpler way is to find the div that contains both and then locate the elements inside.
    # Let's try to locate the stat card by its name and then check the value.
    rotas_card = page.locator("div:has-text('Rotas este mês')").locator("p.text-2xl")
    expect(rotas_card).to_have_text("0")
    print("Dashboard stats are correct for a new user.")

    # --- Routes Page Verification ---
    print("Verifying Routes page...")
    page.get_by_role("link", name="Rotas").click()
    page.wait_for_url("**/rotas", timeout=10000)
    # Check for the "Nenhuma rota encontrada" message
    expect(page.get_by_text("Nenhuma rota encontrada")).to_be_visible()
    print("Routes page is empty for a new user.")

    # --- Activity Page Verification ---
    print("Verifying Activity page...")
    page.get_by_role("link", name="Atividade").click()
    page.wait_for_url("**/atividade", timeout=10000)
    # Check for the "Nenhuma atividade encontrada" message
    expect(page.get_by_text("Nenhuma atividade encontrada")).to_be_visible()
    print("Activity page is empty for a new user.")

    # --- Notifications Page Verification ---
    print("Verifying Notifications page...")
    page.get_by_role("link", name="Notas").click()
    page.wait_for_url("**/notificacoes", timeout=10000)
    # Check for the "Nenhuma notificação" message
    expect(page.get_by_text("Nenhuma notificação")).to_be_visible()
    print("Notifications page is empty for a new user.")

    # --- Go back to Dashboard and take screenshot ---
    print("Navigating back to Dashboard for screenshot...")
    page.get_by_role("link", name="Home").click()
    page.wait_for_url("**/app", timeout=10000)

    print("Taking screenshot of the clean dashboard...")
    page.screenshot(path="jules-scratch/verification/verification.png")
    print("Screenshot taken.")


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_internal_pages(page)
        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
            raise
        finally:
            browser.close()
