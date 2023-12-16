import Link from "next/link";

export default function Card({ p, handleBtnDetail, handleHoverImage, hoverImg, handleRelease = null, handleNickname = null }: any) {
    return (
        <div className="card">
            <div className="card-image">
                {handleNickname !== null && (
                    <button onClick={() => handleNickname(p.id)}>{p.nickname ? 'change' : 'set'} nickname</button>
                )}
                <img className="w-auto h-full mx-auto" onMouseOver={() => handleHoverImage(p.name)} src={p.name === hoverImg ? p.imageHover : p.image} />
            </div>
            <div className="p-5">
                <h3 className="text-xl font-bold">{p.name} {p.nickname && ` - ${p.nickname}`}</h3>
            </div>
            <div className="p-5 text-center border-t">
                {handleRelease !== null ? (
                    <>
                        <Link href="/pokemon/detail">
                            <button onClick={() => handleBtnDetail(p)} className="btn btn-detail">Detail</button>
                        </Link>
                        <button onClick={() => handleRelease(p.id)} className="btn btn-release">Release</button>
                    </>
                ) : (
                    <Link href="/pokemon/detail">
                        <button onClick={() => handleBtnDetail(p)} className="btn btn-detail mr-2">Detail Pokemon</button>
                    </Link>
                )}
            </div>
        </div>
    )
}