import { useEffect, useState } from "react"
import { setPokeId, setPokeUrl } from "@/store/IdPokemonSlice"
import { useDispatch } from "react-redux"
import Link from "next/link"
import Card from "@/component/card"
import Loader from "@/component/loader"
import Pagination from "@/component/pagination"

export default function List() {
    const [loading, setLoading] = useState(true)
    const [hoverImg, setHoverImg] = useState('')
    const [pokemons, setPokemons] = useState([])
    const [detailP, setDetailP] = useState({
        total: 0,
        next: null,
        prev: null,
        page: 1
    })
    const dispatch = useDispatch()

    const getList = async (url: string, nav?: string) => {
        setLoading(true)
        const fData = await fetch(url)
        const data = await fData.json()

        if (data.results) {
            const pok = data.results.map((p: any) => {
                const splitURL = p.url.split('/')
                const id = splitURL[splitURL.length - 2]

                p.pokeId = id
                p.imageHover = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
                p.image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
                return p
            })

            setPokemons(pok)
            const newPage = nav ? (nav === 'next' ? detailP.page + 1 : detailP.page - 1) : 1

            setDetailP({
                total: data.count,
                next: data.next,
                prev: data.previous,
                page: newPage
            })

            setLoading(false)
        }
    }

    const handleHoverImage = (img: any) => {
        setHoverImg(img)
    }

    const handlePaging = (nav: string) => {
        if (nav === 'next' && detailP.next !== null) {
            getList(detailP.next, 'next')
        }

        if (nav === 'prev' && detailP.prev !== null) {
            getList(detailP.prev, 'prev')
        }
    }

    const handleBtnDetail = (poke: any) => {
        dispatch(setPokeId(poke.id))
        dispatch(setPokeUrl(poke.url))
    }

    useEffect(() => { getList(`https://pokeapi.co/api/v2/pokemon?limit=12`) }, [])

    return (<>
        <div className="container px-5 md:px-20 py-10 text-center">
            <h2 className="title-page">Pokemon List</h2>
            <h3 className="subtitle-page"> check my pokemon list <Link className="italic underline" href="/pokemon/mylist">here</Link> </h3>

            {loading && (<Loader/>)}

            <div className="grid md:grid-cols-6 gap-4 pt-10">
                {!loading && pokemons.length > 0 && pokemons.map((p: any, i : number) =>
                    <div key={i}>
                        <Card p={p} handleBtnDetail={handleBtnDetail} handleHoverImage={handleHoverImage} hoverImg={hoverImg} />
                    </div>
                )}
            </div>

            <Pagination handlePaging={handlePaging} currentPage={detailP.page} />
        </div>
    </>)
}