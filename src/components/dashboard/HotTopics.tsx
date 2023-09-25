import { Card } from "@/components/ui";
import { WordCloud } from "@/components";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const HotTopics = () => {
  return (
    <Card className='col-span-4 h-[315px] md:h-[630px] lg:h-[500px] xl:h-[583px]'>
      <CardHeader>
        <CardTitle className='text-xl font-bold'>Hot Topics</CardTitle>

        <CardDescription>
          Initiate a quiz by clicking on a topic.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <WordCloud />
      </CardContent>
    </Card>
  );
};

export default HotTopics;
