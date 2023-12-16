import { useEffect, useState } from "react"
import { setPokeId, setPokeUrl } from "@/store/IdPokemonSlice"
import { useDispatch } from "react-redux"
import Link from "next/link"
import Card from "@/component/card"
import Loader from "@/component/loader"
import Pagination from "@/component/pagination"
import Alert from "@/component/alert"

export default function MyList() {
    const listUrl = '/api/pokemon?per_page=8'
    // alert
    const [displayAlert, setDisplayAlert] = useState(false)
    const [alertMsg, setAlertMsg] = useState('')
    const [typeAlert, setTypeAlert] = useState('')

    //form
    const [openForm, setOpenForm] = useState(false)
    const [openFormId, setOpenFormId] = useState(0)
    const [tempNickname, setTempNickname] = useState('')

    const [loading, setLoading] = useState(true)
    const [hoverImg, setHoverImg] = useState('')
    const [pokemons, setPokemons] = useState([])
    const [detailP, setDetailP] = useState({
        total: 0,
        next: null,
        prev: null,
        page: 1,
        totalPage: 0
    })
    const dispatch = useDispatch()

    const getList = async (url: string) => {
        setLoading(true)
        const fData = await fetch(url)
        const data = await fData.json()

        if (data.results) {
            const pok = data.results.map((p: any) => {
                p.imageHover = p.image_hover
                if (p.name != p.original_name) {
                    p.nickname = p.name
                    p.name = p.original_name
                }
                return p
            })

            setPokemons(pok)
            setDetailP({
                total: data.total,
                next: data.next,
                prev: data.prev,
                page: data.page,
                totalPage: data.total_page
            })
            setLoading(false)
        }
    }

    const handleHoverImage = (img: any) => {
        setHoverImg(img)
    }

    const handlePaging = (nav: string) => {
        if (nav === 'next' && detailP.next !== null) {
            getList(detailP.next)
        }

        if (nav === 'prev' && detailP.prev !== null) {
            getList(detailP.prev)
        }
    }

    const handleBtnDetail = (poke: any) => {
        dispatch(setPokeId(poke.pokemon_id))
        dispatch(setPokeUrl(`https://pokeapi.co/api/v2/pokemon/${poke.pokemon_id}`))
    }

    const handleRelease = async (id: number) => {
        let generateNumber = Math.random() * 100
        generateNumber = Math.floor(generateNumber)

        const fDel = await fetch(`/api/pokemon?id=${id}&prime_number=${generateNumber}`, { method: 'DELETE' })
        const del = await fDel.json()

        const tpAlert = fDel.status === 200 ? 'success' : 'error'
        if (del) {
            setAlertMsg(del.message)
            setTypeAlert(tpAlert)
            setDisplayAlert(true)

            if (fDel.status === 200) {
                getList(listUrl)
            }

            setTimeout(() => {
                setDisplayAlert(false)
            }, 2000);
        }
    }

    const handleSubmitNickname = async (id: number) => {
        const fUpdate = await fetch(`/api/pokemon?id=${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name: tempNickname })
        })
        const update = await fUpdate.json()

        if (update) {
            const alertType = fUpdate.status === 200 ? 'success' : 'error'
            setTypeAlert(alertType)
            setDisplayAlert(true)
            setAlertMsg(update.message)
            setOpenForm(false)
            setTempNickname('')

            if (fUpdate.status === 200) {
                getList(listUrl)
            }

            setTimeout(() => {
                setDisplayAlert(false)
            }, 2000);
        }
    }

    const handleFormNickname = (id: number) => {
        setOpenForm(true)
        setOpenFormId(id)
    }

    useEffect(() => { getList(listUrl) }, [])

    return (<>
        {displayAlert && <Alert message={alertMsg} alertType={typeAlert} />}
        <div className="container px-5 md:px-20 py-10 text-center">
            <h2 className="title-page">My Pokemon List</h2>
            <h3 className="subtitle-page"> let's catch more pokemon <Link className="italic underline" href="/">here</Link> </h3>

            {loading && (<Loader />)}

            {!loading && pokemons.length === 0 && (
                <h4 className="mt-20 font-bold text-4xl">You have no pokemon, let's go cath them</h4>
            )}

            <div className="grid md:grid-cols-4 gap-4 pt-10">
                {!loading && pokemons.length > 0 && pokemons.map((p: any) =>
                    <div key={p.id}>
                        {openForm && p.id === openFormId && (
                            <div className="mb-5">
                                <input type="text" name="nickname" id="nickname" placeholder="nickname" onChange={({ target }) => setTempNickname(target.value)} />
                                <button onClick={() => setOpenForm(false)} className="btn btn-light w-1/3">Cancel</button>
                                <button onClick={() => handleSubmitNickname(p.id)} className="btn btn-submit w-1/2 ml-2">Save</button>
                            </div>
                        )}
                        <Card
                            p={p} handleBtnDetail={handleBtnDetail} handleHoverImage={handleHoverImage}
                            hoverImg={hoverImg} handleRelease={handleRelease} handleNickname={handleFormNickname}
                        />
                    </div>
                )}
            </div>

            {detailP.totalPage > 1 && (<Pagination handlePaging={handlePaging} currentPage={detailP.page} />)}

        </div>
    </>)
}