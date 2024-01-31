import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { browser } from 'k6/experimental/browser';
import { expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.0/index.js'

const data = new SharedArray('users', function () {
    // here you can open files, and then do additional processing or generate the array with data dynamically
    const f = JSON.parse(open('./people.json'));
    return f; // f must be an array[]
});

const categories = [
    'binoculars',
    'telescopes',
    'accessories',
    'assembly',
    'travel',
    'books',
    null,
]

const products = [
    '0PUK6V6EV0',
    '1YMWWN1N4O',
    '66VCHSJNUP',
    '6E92ZMYYFZ',
    '9SIQT8TOJO',
    'L9ECAV7KIM',
    'LS4PSXUNUM',
    'OLJCESPC7Z',
    'HQTGWGPNH4',
]

const currencies = [
    'USD',
    'EUR',
    'JPY',
    'CAD',
    'AUD',
    'GBP',
    'CHF',
]

export const options = {
    scenarios: {
        ui: {
            executor: 'shared-iterations',
            iterations: 200,
            options: {
                browser: {
                    type: 'chromium',
                },
            },
        },
        api: {
            exec: 'api',
            executor: 'shared-iterations',
            iterations: 200,
        }
    },
    thresholds: {
        checks: ["rate==1.0"]
    }
}

export class Homepage {
    constructor(page) {
        this.page = page;
        this.currencySwitcher = this.page.locator('select[data-cy="currency-switcher"]');
    }

    async goto() {
        await this.page.goto(__ENV.WEB_HOST);
    }

    selectRandomProduct() {
        const productToFind = Math.floor(Math.random() * 10) + 1;
        this.page.locator(`div[data-cy="product-list"] div[data-cy="product-card"]:nth-child(${productToFind})`).click();
    }

    numberOfProducts() {
        return this.page.$$('div[data-cy="product-list"] div[data-cy="product-card"]').length;
    }

    async waitForProductList() {
        await this.page.waitForSelector('div[data-cy="product-list"]');
    }

    selectCurrency(currency) {
        this.currencySwitcher.selectOption(currency);
    }

    selectRandomCurrency() {
        const currencyToFind = Math.floor(Math.random() * currencies.length);
        this.currencySwitcher.selectOption(currencies[currencyToFind]);
    }
}

export class ProductDetailPage {
    constructor(page) {
        this.page = page;
        this.addToCartButton = this.page.locator('button[data-cy="product-add-to-cart"]');
    }

    addToCart() {
        this.addToCartButton.click();
    }

    async goto(productId) {
        await this.page.goto(`${__ENV.WEB_HOST}/product/${productId}`);
    }
}

export class CheckoutPage {
    constructor(page) {
        this.page = page;
        this.emailInput = this.page.locator('input#email');
        this.streetInput = this.page.locator('input#street_address');
        this.zipCodeInput = this.page.locator('input#zip_code');
        this.cityInput = this.page.locator('input#city');
        this.stateInput = this.page.locator('input#state');
        this.countryInput = this.page.locator('input#country');
        this.creditCardNumberInput = this.page.locator('input#credit_card_number');
        this.creditCardExpirationMonthInput = this.page.locator('select#credit_card_expiration_month');
        this.creditCardExpirationYearInput = this.page.locator('select#credit_card_expiration_year');
        this.creditCardCVVInput = this.page.locator('input#credit_card_cvv');
        this.checkoutButton = this.page.locator('button[data-cy="checkout-place-order"]');
    }

    async goto() {
        await this.page.goto(`${__ENV.WEB_HOST}/cart`);
    }

    setEmail(email) {
        this.emailInput.fill(email);
    }

    setStreet(street) {
        this.streetInput.fill(street);
    }

    setZipCode(zipCode) {
        this.zipCodeInput.fill(zipCode);
    }

    setCity(city) {
        this.cityInput.fill(city);
    }

    setState(state) {
        this.stateInput.fill(state);
    }

    setCountry(country) {
        this.countryInput.fill(country);
    }

    setCreditCardNumber(creditCardNumber) {
        this.creditCardNumberInput.fill(creditCardNumber);
    }

    setCreditCardExpirationMonth(creditCardExpirationMonth) {
        this.creditCardExpirationMonthInput.selectOption(String(creditCardExpirationMonth));
    }

    setCreditCardExpirationYear(creditCardExpirationYear) {
        this.creditCardExpirationYearInput.selectOption(String(creditCardExpirationYear));
    }

    setCreditCardCVV(creditCardCVV) {
        this.creditCardCVVInput.fill(creditCardCVV);
    }

    performCheckout() {
        this.checkoutButton.click();
    }
}

export default async function () {
    const context = browser.newContext();
    context.setDefaultTimeout(15000);
    const page = context.newPage();

    try {
        let homepage = new Homepage(page);

        // random person
        const person = data[Math.floor(Math.random() * data.length)];

        await homepage.goto();
        await homepage.waitForProductList();
        homepage.selectCurrency(person.userCurrency);
        sleep(1);

        homepage = new Homepage(page);
        expect(homepage.numberOfProducts()).to.be.above(0);

        homepage.selectRandomProduct();
        sleep(1);

        const productDetailPage = new ProductDetailPage(page);
        await productDetailPage.goto(products[Math.floor(Math.random() * products.length)]);
        productDetailPage.addToCart();
        sleep(1);

        let checkoutPage = new CheckoutPage(page);
        await checkoutPage.goto();
        sleep(1);

        checkoutPage = new CheckoutPage(page);
        checkoutPage.setEmail(person.email);
        checkoutPage.setStreet(person.address.streetAddress);
        checkoutPage.setZipCode(person.address.zipCode);
        checkoutPage.setCity(person.address.city);
        checkoutPage.setState(person.address.state);
        checkoutPage.setCountry(person.address.country);
        checkoutPage.setCreditCardNumber(person.creditCard.creditCardNumber);
        checkoutPage.setCreditCardExpirationMonth(person.creditCard.creditCardExpirationMonth);
        checkoutPage.setCreditCardExpirationYear(person.creditCard.creditCardExpirationYear);
        checkoutPage.setCreditCardCVV(person.creditCard.creditCardCvv);

        checkoutPage.performCheckout();
        sleep(1);

        await page.goto(page.url());

        sleep(1);
    } finally {
        context.close();
    }
}

export function api() {
    http.get(`${__ENV.WEB_HOST}`);
    sleep(.1);

    // random category
    const category = categories[Math.floor(Math.random() * categories.length)];

    // random product
    const product = products[Math.floor(Math.random() * products.length)];

    http.get(`${__ENV.WEB_HOST}/api/products/${product}`);
    sleep(.1);

    // load recommendations
    const queryParams = {
        productIds: [
            products[Math.floor(Math.random() * products.length)]
        ],
    }
    http.get(`${__ENV.WEB_HOST}/api/recommendations`, { queryParams });
    sleep(.1);

    // get ads
    const adQueryParams = {
        "contextKeys": [
            categories[Math.floor(Math.random() * categories.length)],
        ],
    }
    http.get(`${__ENV.WEB_HOST}/api/ads`, { queryParams: adQueryParams });
    sleep(.1);

    // view cart
    http.get(`${__ENV.WEB_HOST}/api/cart`);
    sleep(.1);

    // add to cart
    const productForCart = products[Math.floor(Math.random() * products.length)];
    http.get(`${__ENV.WEB_HOST}/api/products/${productForCart}`);
    const cart_item = {
        "item": {
            "productId": productForCart,
            "quantity": Math.floor(Math.random() * 10) + 1,
        },
        "userId": Math.floor(Math.random() * data.length),
    }
    http.post(`${__ENV.WEB_HOST}/api/cart`, cart_item, { headers: { "Content-Type": "application/json" } });
    sleep(.1);
}
