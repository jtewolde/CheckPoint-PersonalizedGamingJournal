
import Link from 'next/link';

import classes from './game.module.css';

export default function notFound(){
    return (
        <div className={classes.notFoundSection}>

            <h1 className={classes.notFoundTitle}>
                Game Not Found
            </h1>

            <p className={classes.notFoundText}>
                The game that you are trying to search for, was not found.
                Try again with a different name in the search bar or return back to your Dashboard
            </p>

            <Link href="/dashboard">Return to Dashboard</Link>

        </div>
    )
}