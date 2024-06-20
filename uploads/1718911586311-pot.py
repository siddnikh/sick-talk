from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import time
from selenium.webdriver.support import expected_conditions as EC

#Install Driver
capa = DesiredCapabilities.CHROME
capa["pageLoadStrategy"] = "none"
opts = webdriver.ChromeOptions()
opts.headless = True
opts.add_argument("--incognito")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=opts, desired_capabilities=capa)
PROFILE_URL = "https://www.sportskeeda.com/profile/nikita-nikhil"
n = 6 #articles to like

def get_parent_element(element):
    parent = element.find_element(by=By.XPATH, value="..") #anchor tag
    return parent.get_attribute("href")

#Step 1: Get Profile URL
driver.get(PROFILE_URL)
time.sleep(5)

#Step 2: Get top n Article URLs from the page
article_divs = driver.find_elements(by=By.XPATH, value="//div[contains(@class,'author_post')]")
article_divs = article_divs[0:n]
article_urls = list(map(get_parent_element, article_divs))

for article_url in article_urls:
    count = 1
    new_tab_name = f"tab{count}"
    wait = WebDriverWait(driver, 10)

    driver.execute_script(f"window.open('{article_url}', '{new_tab_name}');")
    print(f'just opened: {article_url}')
    driver.switch_to.window(new_tab_name)

    # 3. Get the like button from each and press
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.like-action')))
    driver.execute_script("window.stop();")
    like_button = driver.find_element(by=By.XPATH, value="//div[contains(@class,'like-action')]")
    like_button.click()
    like_like_button = driver.find_element(by=By.XPATH, value="//div[contains(@title,'Like reaction')]")
    like_like_button.click()
    print(f"Liked: {driver.title}")

    count += 1

print(f"Liked {n} articles from your profile!")
driver.close()