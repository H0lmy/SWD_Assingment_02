import Link from 'next/link'

export default function Home() {
  return (
    <div className="home-actions">
      <Link href="/add"><button>Add Appliance</button></Link>
      <Link href="/search"><button>Search Appliance</button></Link>
      <button>Update Appliance</button>
      <button>Delete Appliance</button>
    </div>
  )
}
