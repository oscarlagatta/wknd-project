import './style.css';
import {useEffect, useState} from "react";
import supabase from './supabase';

const App = () => {

    const [showForm, setShowForm] = useState(false);
    const [facts, setFacts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentCategory, setCurrentCategory] = useState('All');

    useEffect(() => {
        async function getFacts() {
            setIsLoading(true);

            let query = supabase
                .from('facts')
                .select('*',);

            if (currentCategory !== 'all') {
                query = query.eq('category', currentCategory)
            }

            const {data: facts, error} = await query
                .order('votesInteresting', {ascending: false})
                .limit(1000);
            if (!error) {
                setFacts(facts);
            } else {
                alert('There was a problem loading data')
            }
            setIsLoading(false);
        }

        getFacts();
    }, [currentCategory]);

    return (
        <>
            <Header showForm={showForm} setShowForm={setShowForm}/>

            {showForm ? <NewFactForm setFacts={setFacts} setShowForm={setShowForm}/> : null}

            <main className="main">
                <CategoryFilter setCurrentCategory={setCurrentCategory}/>
                {isLoading ? <Loader/> : <FactList facts={facts} setFacts={setFacts} />}
            </main>
        </>
    );
}

const Loader = () => {
    return (
        <p className="message">Loading....</p>
    )
}
const Header = ({showForm, setShowForm}) => {
    const AppTitle = 'Interview Facts';

    return (
        <header className="header">
            <div className="logo">
                <img src="logo.png" alt="Interviews Facts logo"/>
                <h1>{AppTitle}</h1>
            </div>
            <button className="btn btn-large btn-open"
                    onClick={() => setShowForm((show) => !showForm)}>
                {showForm ? "Close" : "Share a fact"}
            </button>
        </header>
    )
}

const CATEGORIES = [
    {name: "technology", color: "#3b82f6"},
    {name: "science", color: "#16a34a"},
    {name: "finance", color: "#ef4444"},
    {name: "society", color: "#eab308"},
    {name: "entertainment", color: "#db2777"},
    {name: "health", color: "#14b8a6"},
    {name: "history", color: "#f97316"},
    {name: "news", color: "#8b5cf6"},
];

function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:'
}

const NewFactForm = ({setFacts, setShowForm}) => {
    const [text, setText] = useState('');
    const [source, setSource] = useState('');
    const [category, setCategory] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const handleSubmit = async (e) => {
        // 1. prevent the browser reload
        e.preventDefault();

        console.log(text, source, category);

        // check if the data i valid, create a new fact
        if (text && isValidHttpUrl(source) && category && textLength <= 200) {
            setIsUploading(true);
            // upload the fact to supabase and receive the ew fact object
            const {data: newFact, error} = await supabase
                .from('facts')
                .insert({text, source, category})
                .select();

            setIsUploading(false);
            // add the new fact to the user interface, add it to the state.
            if(!error) setFacts((facts) => [newFact[0], ...facts]);

            // reset the input fields
            setText('');
            setSource('');
            setCategory('')

            // close the entire form
            setShowForm(false);
        }

    }


    const textLength = text.length;
    return (
        <form className="fact-form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Share a fact with the world..."
                   value={text}
                   onChange={(e) => setText(e.target.value)}
                   disabled={isUploading}
            />
            <span>{200 - textLength}</span>

            <input type="text" placeholder="Trustworthy source..."
                   value={source}
                   onChange={(e) => setSource(e.target.value)} disabled={isUploading}/>
            <select value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isUploading}>
                <option value="">Choose category:</option>
                {
                    CATEGORIES.map(cat =>
                        <option key={cat.name}
                                value={cat.name}>{cat.name.toUpperCase()}</option>)
                }

            </select>
            <button className="btn btn-large" disabled={isUploading}>Post</button>
        </form>
    )
}


const CategoryFilter = ({setCurrentCategory}) => {
    return (
        <aside>
            <ul>
                <li className="category">
                    <button className="btn btn-all-categories" onClick={() => setCurrentCategory('all')}>All</button>
                </li>
                {
                    CATEGORIES.map(cat => (
                        <li key={cat.name} className="category">
                            <button
                                className="btn btn-category"
                                style={{backgroundColor: cat.color}}
                                onClick={() => setCurrentCategory(cat.name)}
                            >{cat.name}
                            </button>
                        </li>
                    ))
                }

            </ul>

        </aside>
    )
}

const FactList = ({facts, setFacts}) => {

    if (facts.length === 0) {
        return <p className="message">No facts for this category yet! Create a new Fact</p>
    }
    return (
        <section>
            <ul className="fact-list">
                {facts.map(fact => (
                    <Fact key={fact.id} fact={fact} setFacts={setFacts}/>
                ))}
            </ul>
            <p>There are {facts.length} inetview fact/s in the database.</p>
        </section>
    )
}

const Fact = ({fact, setFacts}) => {

    const [isUpdating, setIsUpdating] = useState(false);
    const isDisputed = fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;
    const handleVote = async (columnName) => {
        setIsUpdating(true);
        const { data: updatedFact, error } = await supabase
            .from('facts')
            .update({[columnName]: fact[columnName] + 1 })
            .eq('id', fact.id)
            .select();
        setIsUpdating(false);
        if (!error) setFacts(facts =>
            facts.map( f => f.id === fact.id ? updatedFact[0] : f)
        );
    }

    return (
        <li className="fact">
            <p>
                {isDisputed ? <span className="disputed">[⛔️DISPUTED]</span> : null }
                {fact.text}
                <a className="source" href={fact.source} target="_blank">(Source)</a>
            </p>
            <span className="tag" style={{
                backgroundColor: CATEGORIES.find(cat => cat.name === fact.category).color
            }}>{fact.category}</span>
            <div className="vote-buttons">
                <button onClick={() => handleVote('votesInteresting')} disabled={isUpdating}>👍 {fact.votesInteresting}</button>
                <button onClick={() => handleVote('votesMindblowing')}>🤯 {fact.votesMindblowing}</button>
                <button onClick={() => handleVote('votesFalse')}>⛔️ {fact.votesFalse}</button>
            </div>
        </li>
    )
}

export default App;
