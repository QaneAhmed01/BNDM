import { CreatePollForm } from "@/components/CreatePollForm";

export default function CreatePollPage() {
    return (
        <main className="min-h-screen p-6 md:p-10">
            <div className="max-w-2xl mx-auto space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-preg-ink">Create a Name Poll</h1>
                    <p className="text-preg-ink/60">
                        Add your favorite names, set a duration, and share the link with friends and family.
                    </p>
                </header>
                <CreatePollForm />
            </div>
        </main>
    );
}
