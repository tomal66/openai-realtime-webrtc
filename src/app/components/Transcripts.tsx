
    import React from 'react';
    import { Transcript } from '../types';

    interface TranscriptsProps {
        transcripts: Transcript[];
    }

    const Transcripts: React.FC<TranscriptsProps> = ({ transcripts }) => {
        return (
            <div className="overflow-y-auto h-64 border rounded p-4 bg-gray-50">
                {transcripts
                    .slice()
                    .reverse()
                    .map((transcript, index) => (
                        <div
                            key={index}
                            className={`mb-2 p-2 rounded ${
                                transcript.role === 'user'
                                    ? 'bg-blue-100 text-blue-900'
                                    : 'bg-green-100 text-green-900'
                            }`}
                        >
                            <p className="text-sm">
                                <strong>{transcript.role === 'user' ? 'You' : 'Bot'}</strong>{' '}
                                <span className="text-gray-500 text-xs">
                                    {new Date(transcript.timestamp).toLocaleTimeString()}
                                </span>
                            </p>
                            <p className="text-base">{transcript.content}</p>
                        </div>
                    ))}
            </div>
        );
    };

    export default Transcripts;