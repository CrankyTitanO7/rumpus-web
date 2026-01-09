export async function getRandomYalie() {
  const res = await fetch("/api/yalie");

  if (!res.ok) {
    throw new Error("Failed to fetch Yalie");
  }

  const data = await res.json();

  return {
    fname: data.fname,
    lname: data.lname,
    year: data.year,
    profile: data.profile,
    college: data.college,
  };
}
