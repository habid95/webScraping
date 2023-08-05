import puppeteer from 'puppeteer';

import xlsx from "xlsx";

import urlConst from "./const/index.js";


async function getCategories(page) {


    // su busca todos los anchor de los ul del menu 
    const links = await page.$$eval(".level-top > a:first-child", anchor => anchor.map(ele => ele.href))

    console.log("links", links)

    return links

}

async function navigateCategorie(page, url) {

    try {

        // console.log("navigateCategorie ----------------", url)
        // se naega por cada una de las url enviadas
        await page.goto(url);

        // await page.waitFor(300)
        const result = await page.evaluate(() => {

            // obtenemos todo el listado de los productos
            let productos = document.querySelectorAll(".product-item")

            // obtenemos la informacion de cada uno de los productos
            return [...productos].map(ele => {
                return {
                    name: ele.querySelector(".product-item-link").innerText,
                    price: ele.querySelector(".price").innerText,
                    degrees: ele.querySelector(".product-subtitle").innerText,
                    description: ele.querySelector(".description").innerText,
                }
            });
        })

        return result
    } catch (error) {
        console.log(error)
    }

}


// funcion principal
async function main() {

    // se crea una intancia puppeteer
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 400
    });
    const page = await browser.newPage();


    // el navegador se redirecciona a la siguiente pagina 
    await page.goto(urlConst.BASE_URL);

    // metodo que trae las categorias
    let categories = await getCategories(page)

    // se elimina los dos ultimos links que no tienen que ver con alchol
    categories = categories.slice(1, categories.length - 2)
    console.log(categories)


    let data = []

    // se crea un ciclo for para navegar a cada una de las url
    for (const categorie in categories) {
        console.log(`${categorie}: ${categories[categorie]}`);
        const url = categories[categorie]
        let dataCategory = await navigateCategorie(page, url)
        // se inserta la informacion que se obtuvo de cada una de las categorias
        if (dataCategory)
            data.push(...dataCategory)

    }

    // Se guarda la informacion en un excel

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "Alcohol.xls");

    // cerramos el navegador
    await page.close();
    return
}

await main();


