import Link from 'next/link'

export default function Home() {
  return (
    <div className="home-actions">
      <Link href="/add"><button>Add Appliance</button></Link>
      <Link href="/search"><button>Search Appliance</button></Link>
      <Link href= "/update"><button>Update data</button></Link>
      <Link href="/delete/appliance"><button>Delete Appliance</button></Link>
    </div>
  )
}
