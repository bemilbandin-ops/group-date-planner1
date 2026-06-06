export function getVoteCount(suggestion: { votes: { vote_type: "yes" | "no" | "maybe" }[] }, type: "yes" | "no" | "maybe") {
  return suggestion.votes.filter(v => v.vote_type === type).length;
}

export function getSortedSuggestions(suggestions: { votes: { vote_type: "yes" | "no" | "maybe"; id: string }[] }[]) {
  return [...suggestions].sort((a, b) => {
    const aYes = getVoteCount(a, "yes");
    const bYes = getVoteCount(b, "yes");
    const aNo = getVoteCount(a, "no");
    const bNo = getVoteCount(b, "no");
    
    if (bYes !== aYes) return bYes - aYes;
    if (aNo !== bNo) return aNo - bNo;
    return (b.votes?.length || 0) - (a.votes?.length || 0);
  });
}
