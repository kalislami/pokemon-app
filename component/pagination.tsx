export default function Pagination({handlePaging, currentPage} : any) {
    return  <div className="py-10">
        <button className="btn btn-light" onClick={() => handlePaging('prev')}> Prev </button>
        <span> Page {currentPage} </span>
        <button className="btn btn-light" onClick={() => handlePaging('next')}> Next </button>
    </div>
}