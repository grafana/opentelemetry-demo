import http from 'k6/http';
import { check, sleep } from 'k6';
import { browser } from 'k6/experimental/browser';

import people from './people.json';

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
    '2JAZZY3GM2N',
    '66VCHSJNUP',
    '6E92ZMYYFZ',
    '9SIQT8TOJO',
    'L9ECAV7KIM',
    'LS4PSXUNUM',
    'OLJCESPC7Z',
    'HQTGWGPNH4',
]

export const options = {
    scenarios: {
        ui: {
            executor: 'shared-iterations',
            options: {
                browser: {
                    type: 'chromium',
                },
            },
        },
    },
    thresholds: {
        checks: ["rate==1.0"]
    }
}

export default async function () {
    const context = browser.newContext();
    const page = context.newPage();

    http.get(`${__ENV.WEB_HOST}`);
    sleep(1);

    try {
        await page.goto(`http://${__ENV.WEB_HOST}`);

        const productToFind = Math.floor(Math.random() * 9) + 1;

        const detailPageButton = page.locator(`#product-list div.product:nth-child(${productToFind}) a.btn`);

        await Promise.all([page.waitForNavigation(), detailPageButton.click()]);

        check(page, {
            'header': p => p.locator('h1').textContent() == 'Faros',
        });

        // Product detail page
        page.locator('input[name="add_to_cart[quantity]"]').type(1);
        const addButton = page.locator('button#add_to_cart_add')

        await Promise.all([page.waitForNavigation(), addButton.click()]);

        // checkout
        const checkoutButton = page.locator('a#checkout');

        await Promise.all([page.waitForNavigation(), checkoutButton.click()]);

        check(page, {
            'header': p => p.locator('h1').textContent() == 'Checkout Succeeded!',
        });

        page.waitForTimeout(5000);
    } finally {
        page.close();
    }
}
