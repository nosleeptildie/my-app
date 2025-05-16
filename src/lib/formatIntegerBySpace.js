export default function formatIntegerBySpace(value) {
    if (!value) return ''
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}