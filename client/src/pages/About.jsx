import PageFrame from '../components/PageFrame'

function About() {
  return (
    <PageFrame
      eyebrow="The people behind the plans"
      title="Travel, with a little more feeling."
      description="We believe the best journeys leave space for the unexpected and make the details feel effortless."
    >
      <div className="story-strip">
        <p>Local knowledge, considered pacing, and places that feel connected to where you are. That's how we plan trips worth remembering.</p>
        <div className="story-stat"><strong>19+</strong><span>places to start</span></div>
        <div className="story-stat"><strong>1</strong><span>trip, your way</span></div>
      </div>
      <div className="section-subheading"><span>Our approach</span><span>Good trips start with listening.</span></div>
      <div className="story-loading"><div><h2>Grounded in place</h2><p>We pair considered routes with the freedom to make a day your own.</p></div><span className="story-stamp">Go<br />well</span></div>
    </PageFrame>
  )
}

export default About