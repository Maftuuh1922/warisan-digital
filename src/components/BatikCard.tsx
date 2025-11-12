import { Link } from 'react-router-dom';
import { motion, Variants, Easing } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import type { Batik } from '@shared/types';
interface BatikCardProps {
  batik: Batik;
  index: number;
}
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: 'easeOut' as Easing,
    },
  }),
};
export function BatikCard({ batik, index }: BatikCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Link to={`/batik/${batik.id}`} className="block h-full group">
        <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 ease-in-out hover:shadow-xl border-border/60 group-hover:border-brand-accent/50">
          <CardHeader className="p-0">
            <div className="aspect-[4/3]">
              <img
                src={batik.imageUrl}
                alt={batik.name}
                className="object-cover w-full h-full"
              />
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-grow">
            <Badge variant="secondary" className="mb-2">{batik.motif}</Badge>
            <CardTitle className="text-xl font-semibold mb-2">{batik.name}</CardTitle>
            <p className="text-muted-foreground text-sm line-clamp-3">{batik.history}</p>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex justify-between items-center">
            <p className="text-sm font-medium text-brand-accent">
              By {batik.artisanName}
            </p>
            <div className="flex items-center text-sm font-semibold text-foreground/80 group-hover:text-brand-accent transition-colors">
              Details <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}