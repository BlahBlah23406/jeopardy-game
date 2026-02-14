import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Wait for server
        print("Navigating to app...")
        try:
            page.goto("http://localhost:5173", timeout=10000)
        except:
            print("Retrying connection...")
            time.sleep(2)
            page.goto("http://localhost:5173")

        # 1. Setup Phase
        # We need to wait for the setup screen to load.
        # The button "Continue to Players" should be visible.
        # But wait, initially it might be loading or animating.
        print("Waiting for Setup Screen...")
        try:
            page.wait_for_selector("text=Continue to Players", timeout=5000)
        except:
            # Fallback for debugging
            page.screenshot(path="verification/debug_setup.png")
            print("Setup screen not found. See debug_setup.png")
            browser.close()
            return

        print("Clicking 'Continue to Players'...")
        page.get_by_role("button", name="Continue to Players").click()

        # 2. Input Phase - Initial State
        print("Checking Initial State...")
        # Wait for transition
        page.wait_for_selector("#player-input", timeout=5000)

        textarea = page.locator("#player-input")
        # Check button text. It might be partial match if my locator logic is loose, but 'has_text' is good.
        # "Add 4 more players..."
        button = page.locator("button", has_text="Add 4 more players")

        if not button.is_visible():
            print("ERROR: Initial button text not found!")
            print(page.content())
            page.screenshot(path="verification/error_initial.png")
            browser.close()
            return

        if not button.is_disabled():
            print("ERROR: Button should be disabled!")

        # 3. Enter 2 players
        print("Entering 2 players...")
        textarea.fill("Alice\nBob")

        # Check intermediate state
        # React state update might take a tick
        page.wait_for_timeout(100)

        button_intermediate = page.locator("button", has_text="Add 2 more players")
        if not button_intermediate.is_visible():
            print("ERROR: Button text not updated for 2 players!")
            page.screenshot(path="verification/error_intermediate.png")

        # Take screenshot of the intermediate state (showing validation)
        page.screenshot(path="verification/verification_intermediate.png")
        print("Intermediate screenshot saved.")

        # 4. Enter valid players
        print("Entering 4 players...")
        textarea.fill("Alice\nBob\nCharlie\nDave")

        # Check valid state
        page.wait_for_timeout(100)

        button_valid = page.locator("button", has_text="Generate Teams")
        if not button_valid.is_visible():
            print("ERROR: Button text not updated for valid state!")
            page.screenshot(path="verification/error_valid.png")

        if button_valid.is_disabled():
            print("ERROR: Button should be enabled!")

        # Take final screenshot
        page.screenshot(path="verification/verification_final.png")
        print("Final screenshot saved.")

        browser.close()

if __name__ == "__main__":
    run()
