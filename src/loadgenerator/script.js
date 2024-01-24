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

    try {
        await page.goto(__ENV.WEB_HOST);

        const productToFind = Math.floor(Math.random() * 10) + 1;

        await page.locator(`div[data-cy="product-list"] div[data-cy="product-card"]:nth-child(${productToFind})`).click();
        sleep(1);

        // Product detail page
        check(page, {
            'add_to_cart_button': p => p.locator('button[data-cy="product-add-to-cart"]').textContent() === 'Add To cart',
        });

        //page.locator('select[data-cy="product-quantity"]').selectOption(1);
        await page.locator('button[data-cy="product-add-to-cart"]').click();
        sleep(1);

        // checkout
        await page.locator('button[data-cy="checkout-place-order"]').click();
        sleep(1);
    } finally {
        context.close();
    }
}
