import Link from 'next/link'

export default function Home() {
  return (
    <div className="home-actions">
      <h1 className="home-title">Appliance Manager</h1>
      <p className="home-subtitle">Manage users and their appliances</p>
      <Link href="/add"><button>Add Appliance</button></Link>
      <Link href="/search"><button>Search Appliance</button></Link>
      <Link href="/update"><button>Update data</button></Link>
      <Link href="/delete/appliance"><button className="danger">Delete Appliance</button></Link>
    </div>
  )
}
