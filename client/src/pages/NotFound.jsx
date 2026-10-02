import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageFrame from '../components/PageFrame'

function NotFound() {
  return (
    <PageFrame
      eyebrow="A little off route"
      title="This page isn't on the map."
      description="Let's get you back to somewhere worth going."
    >
      <Link className="button button-green" to="/">Back to home <ArrowRight size={16} /></Link>
    </PageFrame>
  )
}

export default NotFound