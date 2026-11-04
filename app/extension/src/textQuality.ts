const ignored = new Set(`a an and are as at be been but by can did do does for from had has have how i in is it its me my of on or our say source sources the their them they this to was were what when where which who with you your saved research evidence summarize summarise summary key collected qualifications appear previous last time find found learn learned give please`.split(' '));

export function topicWords(text: string): Set<string> {
  return new Set((text.toLowerCase().match(/[a-z]{3,}/g) || []).filter(word => !ignored.has(word)));
}

export function hasEnoughTopicWords(text: string): boolean {
  const normalized = text.toLowerCase().trim().replace(/[?.!]+$/, '').replace(/\s+/g, ' ');
  const broadQuestion = normalized === 'summarize the key evidence collected'
    || normalized === 'summarise the key evidence collected'
    || normalized === 'what qualifications appear in my saved evidence';
  return topicWords(text).size >= 1 || broadQuestion;
}

export function sharesTopicWords(left: string, right: string): boolean {
  const leftWords = topicWords(left);
  return [...topicWords(right)].some(word => leftWords.has(word));
}
