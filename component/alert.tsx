export default function Alert({ message, alertType }: any) {
    const bgAlert = alertType == 'success' ? 'alert-green' : 'alert-red'

    return <div className={`${bgAlert}`}>
        <h2>{message}</h2>
    </div>
}