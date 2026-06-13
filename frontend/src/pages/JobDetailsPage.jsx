import { Helmet } from "react-helmet-async";

function JobDetailsPage() {
  const job = {
    title: "Software Support Engineer",
    location: "Bangalore, Karnataka, India",
    datePosted: "2026-06-14",
    description:
      "Apply for Software Support Engineer at NoPromptJobs. Fix bugs, monitor logs, test new features and support recruiters and candidates.",
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "NoPromptJobs",
      sameAs: "https://nopromptjobs.com",
      logo: "https://nopromptjobs.com/logo.png",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bangalore",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>{job.title} Jobs in Bangalore | NoPromptJobs</title>
        <meta name="description" content={job.description} />
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>

      <main style={{ padding: "80px" }}>
        <h1>{job.title}</h1>
        <p>{job.location}</p>
        <p>{job.description}</p>

        <a href={`/apply-job?role=${encodeURIComponent(job.title)}`}>
          Apply Now
        </a>
      </main>
    </>
  );
}

export default JobDetailsPage;