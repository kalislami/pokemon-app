import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../connect";

type Data = {
    results?: Pokemon[],
    message?: string,
    next?: string | null,
    prev?: string | null,
    total?: number,
    total_page?: number,
    page?: number,
    per_page?: number,
}

type Pokemon = {
    id?: number,
    pokemon_id: number,
    image: string,
    image_hover: string,
    name: string,
    original_name: string,
    last_rename: string
}

class ProductController {

    private async getLastId() {
        const db = await connectDB()
        const lastId = await db.get(`SELECT MAX(id) as id FROM pokemon LIMIT 1`);
        return lastId.id ? lastId.id + 1 : 1
    }

    private async getById(
        id: number,
        select?: string
    ) {
        const db = await connectDB()
        let sql = `SELECT * FROM pokemon WHERE id = ${id} LIMIT 1`;

        if (select) {
            sql = `SELECT ${select} FROM pokemon WHERE id = ${id} LIMIT 1`;
        }

        const data = await db.get(sql);
        return data
    }

    private async getByPokemonId(
        id: number,
        select?: string
    ) {
        const db = await connectDB()
        let sql = `SELECT * FROM pokemon WHERE pokemon_id = ${id} LIMIT 1`;

        if (select) {
            sql = `SELECT ${select} FROM pokemon WHERE pokemon_id = ${id} LIMIT 1`;
        }

        const data = await db.get(sql);
        return data
    }

    async get(
        req: NextApiRequest,
        res: NextApiResponse<Data>,
    ) {
        const { pokemon_id, page, per_page }: any = req.query

        if (pokemon_id) {
            const data = await this.getByPokemonId(pokemon_id)
            return res.status(200).json({ results: data })
        }

        const perPage = per_page ? per_page : 10
        const offset = page ? (page - 1) * perPage : 0
        const currentPage = (offset / perPage) + 1

        const db = await connectDB()
        const totalData = await db.get(`SELECT COUNT(*) as total FROM pokemon`);
        const data = await db.all(`SELECT * FROM pokemon p ORDER BY p.id DESC LIMIT ${perPage} OFFSET ${offset}`);
        const totalPage = Math.ceil(totalData.total / perPage)
        const next = currentPage >= totalPage ? null : `/api/pokemon?page=${currentPage + 1}&per_page=${perPage}`
        const prev = currentPage <= 1 ? null : `/api/pokemon?page=${currentPage - 1}&per_page=${perPage}`

        console.log(`next: ${next}`);
        console.log(`prev: ${prev}`);
        

        return res.status(200).json({
            total: totalData.total,
            total_page: totalPage,
            page: currentPage,
            per_page: perPage,
            results: data,
            next,
            prev
        })
    }

    async post(
        req: NextApiRequest,
        res: NextApiResponse<Data>
    ) {
        try {
            const body = JSON.parse(req.body)
            body.last_rename = '#first'

            const id = await this.getLastId()
            const values = Object.values(body)

            let validate = true
            values.map(v => { if (v === '') validate = false })
            if (!validate) {
                return res.status(422).json({ message: `Form data is not complete` })
            }

            const getfiftyPersentChance = Math.random() < 0.5
            if (!getfiftyPersentChance) {
                return res.status(422).json({ message: `Catching pokemon failed` })
            }

            values.unshift(id)

            const db = await connectDB()
            const insertSql: string = `INSERT INTO pokemon VALUES (?,?,?,?,?,?,?)`;
            await db.run(insertSql, values);

            return res.status(200).json({
                message: `Congrats! catching pokemon success`,
                results: id
            })
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Catching pokemon failed (server error)' })
        }
    }

    async patch(
        req: NextApiRequest,
        res: NextApiResponse<Data>
    ) {
        try {
            const { id }: any = req.query
            if (!id) res.status(400).json({ message: 'invalid id' })

            const findData = await this.getById(id);
            if (!findData) res.status(404).json({ message: 'id not found' })

            const body = JSON.parse(req.body)

            let validate = body.name === undefined || body.name === ''

            if (validate) {
                return res.status(422).json({ message: `Name is required` })
            }

            const [_, last_name] = findData.last_rename.split('-')
            const oriName = findData.original_name.replaceAll('-', ' ')
            const last_rename = last_name ? `${findData.original_name}-${parseInt(last_name) + 1}` : `${oriName}-0`
            const values = [body.name, last_rename]

            const db = await connectDB();
            const sql: string = `UPDATE pokemon SET name = ?, last_rename = ? WHERE id = ${id}`;
            await db.run(sql, values);

            return res.status(200).json({ message: `Success set nickname` })
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Failed set nickname (server error)' })
        }
    }

    private checkPrimeNumber(number: number) {
        let isPrime = true;

        if (number <= 1) {
            isPrime = false
        }
        else {
            for (let i = 2; i < number; i++) {
                if (number % i == 0) {
                    isPrime = false;
                    break;
                }
            }
        }

        return isPrime
    }

    async remove(
        req: NextApiRequest,
        res: NextApiResponse<Data>
    ) {
        try {
            const { id, prime_number }: any = req.query
            if (!id || !prime_number) return res.status(400).json({ message: 'invalid request' })

            const findData = await this.getById(id);
            if (!findData) return res.status(404).json({ message: 'id not found' })

            const isPrimeNumber = this.checkPrimeNumber(prime_number)
            if (!isPrimeNumber) return res.status(422).json({ message: 'failed release pokemon (generated number is not prime)' })

            const db = await connectDB()
            const sql: string = `DELETE FROM pokemon WHERE id=${id}`;
            await db.run(sql);

            return res.status(200).json({ message: 'Pokemon has been released' })
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({ message: 'release failed (server error)' })
        }
    }

    block(
        req: NextApiRequest,
        res: NextApiResponse<Data>
    ) {
        return res.status(405).json({ message: 'not allowed' })
    }
}

export default new ProductController();