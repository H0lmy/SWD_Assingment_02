import Link from 'next/link'

export default function Home() {
  return (
    <div className="home-actions">
      <Link href="/add"><button>Add Appliance</button></Link>
      <button>Search Appliance</button>
      <button>Update Appliance</button>
      <button>Delete Appliance</button>
    </div>
  )
}
