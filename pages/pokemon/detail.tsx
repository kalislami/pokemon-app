import Alert from "@/component/alert"
import Loader from "@/component/loader"
import { selectPokeId, selectPokeUrl } from "@/store/IdPokemonSlice"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export default function Detail() {
    // global state
    const pokeId = useSelector(selectPokeId)
    const pokeUrl = useSelector(selectPokeUrl)

    // alert
    const [displayAlert, setDisplayAlert] = useState(false)
    const [alertMsg, setAlertMsg] = useState('')
    const [typeAlert, setTypeAlert] = useState('')

    const [isMine, setIsMine] = useState(false)
    const [nickname, setNickname] = useState('')
    const [tempNickname, setTempNickname] = useState('')
    const [openForm, setOpenForm] = useState(false)
    const [mineId, setMineId] = useState(null)

    const [pokeData, setPokeData] = useState({
        name: '',
        weight: 0,
        height: 0,
        base_exp: 0,
        abilities: [],
        image_main: '',
        image_front: '',
        image_back: '',
    })
    const [formData, setFormData] = useState({
        pokemon_id: pokeId,
        image: '',
        image_hover: '',
        name: '',
        original_name: '',
    })
    const [pokeMoves, setPokeMoves] = useState([])
    const [pokeTypes, setPokeTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMove, setLoadingMove] = useState(false)
    const [selectedMove, setSelectedMove] = useState({
        url: '',
        accuracy: 0,
        effect_chance: 0,
        pp: 0,
        power: 0
    })
    const router = useRouter()

    const getDetailPoke = async () => {
        const fPoke = await fetch(pokeUrl)
        const poke = await fPoke.json()

        let abilities = []
        if (poke.abilities.length > 0) {
            abilities = poke.abilities.map((a: any) => {
                return a.ability.name
            })
        }

        setPokeData({
            name: poke.name,
            weight: poke.weight,
            height: poke.height,
            base_exp: poke.base_experience,
            abilities: abilities,
            image_main: poke.sprites.other.home.front_default,
            image_front: poke.sprites.front_default,
            image_back: poke.sprites.back_default
        })
        setFormData({
            pokemon_id: poke.id,
            image: poke.sprites.front_default,
            image_hover: poke.sprites.front_shiny,
            name: poke.name,
            original_name: poke.name,
        })
        setPokeMoves(poke.moves)
        setPokeTypes(poke.types)

        await getMyPoke(poke.id)

        setLoading(false)
    }

    const getMyPoke = async (id: number) => {
        const fMine = await fetch(`/api/pokemon?pokemon_id=${id}`)
        const mine = await fMine.json()

        if (mine.results) {
            setNickname(mine.results.name)
            setMineId(mine.results.id)
            setIsMine(true)
        }
    }

    const displayAbl = () => {
        const result = pokeData.abilities.length > 0 ? pokeData.abilities.toString() : '-'
        return result
    }

    const handleMoveDetail = (url: string) => {
        if (url === selectedMove.url) {
            setSelectedMove({ ...selectedMove, url: '' })
            return
        }

        setSelectedMove({ ...selectedMove, url })
        setLoadingMove(true)

        setTimeout(async () => {

            const fData = await fetch(url)
            const data = await fData.json()

            if (!data) {
                setSelectedMove({ ...selectedMove, url: '' })
                setLoadingMove(false)
                return
            }

            const { accuracy, effect_chance, pp, power } = data
            setSelectedMove({
                url,
                accuracy,
                effect_chance,
                pp,
                power
            })

            setLoadingMove(false)
        }, 1000);
    }

    const handleCatch = async () => {
        const fData = await fetch('/api/pokemon', {
            method: 'POST',
            body: JSON.stringify(formData)
        })

        const data = await fData.json()

        if (data) {
            const alertType = fData.status === 200 ? 'success' : 'error'
            setTypeAlert(alertType)
            setDisplayAlert(true)
            setAlertMsg(data.message)

            if (fData.status === 200) {
                setIsMine(true)
                setNickname(formData.name)
                setMineId(data.results)
            }

            setTimeout(() => {
                setDisplayAlert(false)
                setAlertMsg('')
            }, 2000);
        }
    }

    const handleSubmitNickname = async () => {
        if (mineId == null) {
            setAlertMsg('id not found')
            setTypeAlert('error')
            setDisplayAlert(true)

            setTimeout(() => {
                setAlertMsg('')
                setDisplayAlert(false)
            }, 2000);

            return
        }

        const fUpdate = await fetch(`/api/pokemon?id=${mineId}`, {
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
            setNickname(tempNickname)

            setTimeout(() => {
                setDisplayAlert(false)
                setAlertMsg('')
            }, 2000);
        }
    }

    useEffect(() => {
        if (pokeId === null) router.push('/')
        getDetailPoke()
    }, [])

    return (<>
        {displayAlert && <Alert message={alertMsg} alertType={typeAlert} />}
        {loading && (<Loader />)}
        {!loading && (
            <div>
                <div className="w-full h-full bg-gray-100 grid grid-cols-2 md:grid-cols-3 pb-10 md:px-[200px]">

                    <h2 className="title-page col-span-3 text-center my-4">{pokeData.name} {isMine && pokeData.name != nickname && `(${nickname})`}</h2>

                    <div className="col-span-2 md:col-span-1">
                        <img className="w-auto md:h-[350px] h-[230px] mx-auto" src={pokeData.image_main} />
                    </div>
                    <div>
                        <img className="w-auto md:h-[200px] h-[150px] mx-auto" src={pokeData.image_front} />
                        <img className="w-auto md:h-[200px] h-[150px] mx-auto" src={pokeData.image_back} />
                    </div>

                    <div className="col-span-3 md:col-span-1">
                        <div className="box-detail">
                            <h3>Height {pokeData.height} (Decimeters)</h3>
                            <hr className="col-span-2" />
                            <h3>Weight {pokeData.weight} (Hectograms)</h3>
                            <hr className="col-span-2" />
                            <h3>With {pokeData.base_exp} Experince</h3>
                            <hr className="col-span-2" />
                            <h3>Abilities: {displayAbl()}</h3>
                        </div>
                    </div>

                    <div className="p-2 col-span-3 md:col-span-1">
                        {!isMine && (
                            <button onClick={() => handleCatch()} className="btn btn-submit block w-full">Catch {pokeData.name} (<i>probability 50%</i>)</button>
                        )}

                        {isMine && !openForm && (
                            <button onClick={() => setOpenForm(true)} className="btn btn-submit block w-full">{nickname === pokeData.name ? 'Set' : 'Change'} Nickname</button>
                        )}

                        {openForm && (
                            <div className="mb-5">
                                <input type="text" name="nickname" id="nickname" placeholder="nickname" onChange={({ target }) => setTempNickname(target.value)} />
                                <button onClick={() => setOpenForm(false)} className="btn btn-light w-1/3">Cancel</button>
                                <button onClick={() => handleSubmitNickname()} className="btn btn-submit w-1/2 float-right">Save</button>
                            </div>
                        )}
                        <Link className="btn btn-light block my-2 text-center" href="/pokemon/mylist">My Pokemon List</Link>
                        <Link className="btn btn-light block text-center" href="/">List Pokemon</Link>
                    </div>

                    <div className="col-span-3 md:col-span-2 min-h-full pb-5">
                        <div className="box-types m-2 p-5 bg-[#374eb2] rounded-lg text-gray-100 grid md:grid-cols-3 gap-2 min-h-full">
                            <h3 className="text-center font-semibold md:col-span-3 mb-4">TYPES ({pokeTypes.length})</h3>
                            {pokeTypes.length > 0 && pokeTypes.map((t: any) =>
                                <div key={t.type.name} className="border-2 border-[#f7c100] rounded p-2 h-[45px]">
                                    <p>{`${t.type.name} (${t.slot} slot)`}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-3">
                        <div className="box-moves bg-[#f7c100] m-2 p-5 rounded-lg grid md:grid-cols-4 gap-2">
                            <h3 className="text-center font-semibold md:col-span-4 mb-4">MOVES ({pokeMoves.length})</h3>
                            {pokeMoves.length > 0 && pokeMoves.map((m: any) =>
                                <div className="border-2 border-[#374eb2] rounded p-2">
                                    <p key={m.move.name} className="w-full">{m.move.name}
                                        <button key={`btn-${m.move.name}`} onClick={() => handleMoveDetail(m.move.url)} className="float-right">
                                            ({m.move.url === selectedMove.url && loadingMove && 'loading...'}
                                            {m.move.url === selectedMove.url && !loadingMove ? 'close' : 'view detail'})
                                        </button>
                                    </p>
                                    {selectedMove.url === m.move.url && loadingMove == false && (
                                        <div className="p-2 border-t border-[#374eb2] mt-2">
                                            <p>accuracy {selectedMove.accuracy}%</p>
                                            <p>effect chance {selectedMove.effect_chance}%</p>
                                            <p>powerpoints {selectedMove.pp} times</p>
                                            <p>power value: {selectedMove.power}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

    </>)
}