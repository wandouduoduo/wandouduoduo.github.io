from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait as Wait

print("start refresh gitee pages...")

repo_user_name = "wandouduoduo"
repo_name = "wandouduoduo"
login_user = "wandouduoduo@163.com"
login_pwd = "sx379654946"

url = "https://gitee.com/"+repo_user_name+"/"+repo_name+"/pages"

driver = "D:/Python27/chromedriver.exe"
chrome_options = Options()
chrome_options.add_argument("--window-size=1920,1080")
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument("--headless")
browser=webdriver.Chrome(executable_path=driver, options=chrome_options)

browser.get(url)

Wait(browser, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "item.git-nav-user__login-item")))
print("load finish. url=" + url)
login_btn = browser.find_element_by_class_name("item.git-nav-user__login-item")
login_btn.click()

Wait(browser, 10).until(EC.presence_of_element_located((By.ID, "user_login")))
Wait(browser, 10).until(EC.presence_of_element_located((By.ID, "user_password")))
print("login page load finish.")
user_input = browser.find_element_by_id("user_login")
pwd_input = browser.find_element_by_id("user_password")
login_btn = browser.find_element_by_name("commit")
user_input.send_keys(login_user)
pwd_input.send_keys(login_pwd)
login_btn.click()

Wait(browser, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "button.orange.redeploy-button.ui.update_deploy")))
print("login finish.")
deploy_btn = browser.find_element_by_class_name('button.orange.redeploy-button.ui.update_deploy')

browser.execute_script("window.scrollTo(100, document.body.scrollHeight);")
deploy_btn.click()
dialog = browser.switch_to.alert
dialog.accept()
print("refresh gitee pages finish.")
browser.close()